const acornLoose = require("acorn-loose");
const walk = require("acorn-walk")

function exposeAES(pooky) {
    return new Promise((resolve, reject) => {
        let parse = acornLoose.parse(pooky);
        let max = 0;
        let maxNode = undefined;
        let stopNode = undefined;
        walk.ancestor(parse, {
            FunctionDeclaration(node) { // try to find aes
                if (node.params && node.params.length == 3) { // it has 3 parameters
                    walk.simple(node, { // walk the function that may or may not be AES
                        SwitchStatement(switchNode) { // visit each switch statement
                            if (switchNode.cases) {
                                let arrayExpressionCount = 0;
                                for (let switchCase of switchNode.cases) { // iterate through the cases
                                    if (switchCase.consequent.length > 10) { // walk "long" cases
                                        walk.simple(switchCase, {
                                            ExpressionStatement(expr) {
                                                if (expr.expression && expr.expression.right && expr.expression.right.type == "ArrayExpression")
                                                    arrayExpressionCount++; // count the number of array assignments
                                                    // specifically we're looking for the assigment of transform arrays and such for AES
                                            }
                                        });
                                    }
                                }
                                if (arrayExpressionCount > 10) {
                                    let occ = pooky.split(node.id.name + '(').length - 1; // count the number of times this function is called
                                    if (occ > max) {
                                        maxNode = node;
                                        max = occ; // keep track of the function that's called the most
                                    }
                                }
                            }
                        }
                    });
                } else if (typeof node.params !== 'undefined' && node.params.length == 0) {
                    // this is to look for the "stopping function" that prevents the majority of pooky from executing
                    // we fingerprint it based on calls to Date and Math methods, and Date constructions
                    let mathDateCount = 0;
                    let newDateCount = 0;
                    walk.simple(node, {
                        CallExpression(callNode) {
                            if (callNode.callee && callNode.callee.object && callNode.callee.object.name &&
                                (callNode.callee.object.name == "Math" || callNode.callee.object.name == "Date")) {
                                mathDateCount++;
                            }
                        },
                        NewExpression(newNode) {
                            if (newNode.callee && newNode.callee.name && newNode.callee.name === "Date") {
                                newDateCount++;
                            }
                        }
                    });
                    if (mathDateCount > 1 && newDateCount > 0) {
                        stopNode = node;
                    }
                }
            }
        });

        if (typeof maxNode === 'undefined') reject("No AES found!");
        else {
            console.log(`${maxNode.id.name} identified as AES`);
            console.log(`${stopNode.id.name} identified as the stopping function`);
            let pookySplit = []
            let stopIndex = -1;
            let keVar = 'undefined';

            walk.simple(maxNode, { 
                // we're gonna walk the AES function to look for reverences to the key expansion array
                AssignmentExpression(node) {
                    if (node.operator == '^=') { // look for a bitwise OR assigment, there's not too many
                        if(node.right.type == 'MemberExpression') {
                            if(node.right.object.type == 'MemberExpression') { // two "MemberExpression"s means a 2d array
                                console.log(`Key expansion: ${node.right.object.object.name}`);
                                keVar = node.right.object.object.name
                            }
                        }
                    }
                }
            });

            // expose everything we found to the global context
            let snippet = `\nwindow.exposedAES = ${maxNode.id.name};\nwindow.keArray = ${keVar};\nwindow.getKeArray = ()=>{return ${keVar}};\n`

            if (maxNode.start < stopNode.start) {
                pookySplit = [
                    pooky.substring(0, maxNode.start),
                    pooky.substring(maxNode.start, maxNode.end),
                    snippet,
                    pooky.substring(maxNode.end, stopNode.start),
                    pooky.substring(stopNode.start, stopNode.end),
                    pooky.substring(stopNode.end)
                ];
                stopIndex = 4;
            } else {
                pookySplit = [
                    pooky.substring(0, stopNode.start),
                    pooky.substring(stopNode.start, stopNode.end),
                    pooky.substring(stopNode.end, maxNode.start),
                    pooky.substring(maxNode.start, maxNode.end),
                    snippet,
                    pooky.substring(maxNode.end)
                ]
                stopIndex = 1;
            }

            // disable the stopping function
            pookySplit[stopIndex] = `function ${stopNode.id.name}() {return true;}`;

            resolve(pookySplit.join('')); // resolve with modified pooky code
        }
    })
}

module.exports.exposeAES = exposeAES;
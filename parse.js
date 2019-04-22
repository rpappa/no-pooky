var acornLoose = require("acorn-loose");
const walk = require("acorn-walk")

const fs = require('fs');

let startTime = Date.now();

// let testParse = acornLoose.parse('l2j = new Date(parseInt(u2j[+m2rI.w9x]));');

// walk.simple(testParse, {
//     CallExpression(callNode) {
//         if(callNode.callee && callNode.callee.object && callNode.callee.object.name &&
//             (callNode.callee.object.name == "Math" || callNode.callee.object.name == "Date")) {
//             console.log(callNode);
//         }
//     },
//     NewExpression(newNode) {
//         if(newNode.callee && newNode.callee.name && newNode.callee.name === "Date") {
//             console.log(newNode);
//         }
//     }
// })

// console.log(testParse);

// fs.readFile('pooky.pp.js', 'utf8', (err, data) => {
//     if(err) {
//         console.log(err);
//         return;
//     }

//     // exposeAES(data).then((mod) => {
//     //     console.log(mod);
//     // }).catch((err) => {
//     //     console.log(err);
//     // });
//     // let parse = acornLoose.parse(data);
//     // console.log(Date.now() - startTime);

//     // // console.log(parse);

//     // // clipboardy.writeSync(JSON.stringify(parse));
//     // let max = 0;
//     // let maxNode = undefined;
//     // walk.ancestor(parse, {
//     //     FunctionDeclaration(node) {
//     //         if(node.params && node.params.length == 3) {
//     //             // console.log(node.id.name);
//     //             walk.simple(node, {
//     //                 SwitchStatement(switchNode) {
//     //                     if(switchNode.cases) {
//     //                         let arrayExpressionCount = 0;
//     //                         for(let switchCase of switchNode.cases) {
//     //                             if(switchCase.consequent.length > 10) {
//     //                                 walk.simple(switchCase, {
//     //                                     ExpressionStatement(expr) {
//     //                                         if(expr.expression.right.type == "ArrayExpression")
//     //                                             arrayExpressionCount++;
//     //                                     }
//     //                                 });
//     //                             }
//     //                         }
//     //                         if(arrayExpressionCount > 10) {
//     //                             let occ = data.split(node.id.name).length - 1;
//     //                             console.log(`Found possibility: ${node.id.name} \n Has ${occ} occurances`)
//     //                             if(occ > max) {
//     //                                 maxNode = node;
//     //                                 max = occ;
//     //                             }
//     //                             // console.log(node.id.name);
//     //                             // console.log(data.substring(node.start, node.end));
//     //                             // console.log(Date.now() - startTime);
//     //                         }
//     //                     }
//     //                 }
//     //             });
//     //         }
//     //     }
//     //     /*AssignmentExpression(node, anscestors) {
//     //         // if(node.operator === '=') {
//     //             if(node.left) {
//     //                 if(node.left.object && node.left.object.name && node.left.object.name == "w6u") {
//     //                     // console.log(node);
//     //                 }
//     //                 // if(node.left.name && node.left.name == "w6u") {
//     //                     // console.log(node);
//     //                 if(node.right.type == "ArrayExpression") {
//     //                     if(node.right.elements.length == 15) {
//     //                         let allArrays = true;
//     //                         for(let right of node.right.elements) {
//     //                             if(right.type != "ArrayExpression") allArrays = false;
//     //                         }
//     //                         if(allArrays) {
//     //                             console.log(anscestors);
//     //                         }
//     //                     }
//     //                 }
//     //                 // }
//     //                 // console.log(node.left.object.name);
//     //             }
//     //         // }
//     //     }*/
//     // });

//     // // after the walk maxNode is probably the AES function
//     // console.log(maxNode);

// })
// console.log(acornLoose.parse("1 / * 4 )[2]"));

function exposeAES(pooky) {
    return new Promise((resolve, reject) => {
        let parse = acornLoose.parse(pooky);
        let max = 0;
        let maxNode = undefined;
        let stopNode = undefined;
        let keNames = [];
        walk.ancestor(parse, {
            FunctionDeclaration(node) {
                if (node.params && node.params.length == 3) {
                    // console.log(node.id.name);
                    walk.simple(node, {
                        SwitchStatement(switchNode) {
                            if (switchNode.cases) {
                                let arrayExpressionCount = 0;
                                for (let switchCase of switchNode.cases) {
                                    if (switchCase.consequent.length > 10) {
                                        walk.simple(switchCase, {
                                            ExpressionStatement(expr) {
                                                if (expr.expression && expr.expression.right && expr.expression.right.type == "ArrayExpression")
                                                    arrayExpressionCount++;
                                            }
                                        });
                                    }
                                }
                                if (arrayExpressionCount > 10) {
                                    let occ = pooky.split(node.id.name + '(').length - 1;
                                    console.log(`Found possibility: ${node.id.name} \n Has ${occ} occurances`)
                                    if (occ > max) {
                                        maxNode = node;
                                        max = occ;
                                    }
                                }
                            }
                        }
                    });
                } else if (typeof node.params !== 'undefined' && node.params.length == 0) {
                    // console.log(node);
                    let mathDateCount = 0;
                    let newDateCount = 0;
                    walk.simple(node, {
                        CallExpression(callNode) {
                            if (callNode.callee && callNode.callee.object && callNode.callee.object.name &&
                                (callNode.callee.object.name == "Math" || callNode.callee.object.name == "Date")) {
                                // console.log(callNode);
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
                    // console.log(`${node.id.name}: ${mathDateCount > 1 && newDateCount > 0}`);
                }
            },
            AssignmentExpression(node, anscestors) {
                // if(node.operator === '=') {
                if (node.left) {
                    if (node.left.object && node.left.object.name && node.left.object.name == "w6u") {
                        // console.log(node);
                    }
                    // if(node.left.name && node.left.name == "w6u") {
                    // console.log(node);
                    if (node.right.type == "ArrayExpression") {
                        // console.log(node);
                        if (node.right.elements.length == 15) {
                            let allArrays = true;
                            for (let right of node.right.elements) {
                                if (right.type != "ArrayExpression") allArrays = false;
                            }
                            if (allArrays) {
                                // console.log(anscestors);
                                // console.log(node.left.name);
                                keNames.push(node.left.name);
                            }
                        }
                    }
                    // }
                    // console.log(node.left.object.name);
                }
                // }
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
                AssignmentExpression(node) {
                    if (node.operator == '^=') {
                        if(node.right.type == 'MemberExpression') {
                            if(node.right.object.type == 'MemberExpression') {
                                console.log(`Key expansion: ${node.right.object.object.name}`);
                                keVar = node.right.object.object.name
                            }
                        }
                        // if(node.right.property && node.right.property.type &&
                        //     node.right.property.type != 'Identifier') {
                        //         console.log(node.right);
                        //     }
                    }
                }
            })
            // for(let keName of keNames) {
            //     if(pooky.substring(maxNode.start, maxNode.end).includes(keName)) {
            //         keVar = keName;
            //         console.log(`KeVar: ${keName}`)
            //     }
            // }

            let snippet = `\nwindow​exposedAES = ${maxNode​id​name};\nwindow.keArray = ${keVar};\nwindow​getKeArray = ()=>{return ${keVar}};\n`

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

            resolve(pookySplit.join(''));
            // resolve(pooky.substring(0, maxNode.end) + 
            //     `window.exposedAES = ${maxNode.id.name}` +
            //     pooky.substring(maxNode.end + 1));
        }
    })
}

module.exports.exposeAES = exposeAES;

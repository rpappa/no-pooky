const DynamicReverser = require('./dynreverse-oo.js').DynamicReverser;

const express = require('express');
const bodyParser = require('body-parser');
const aesjs = require('aes-js');

const dynCookies = require('./dynCookies.js');

const apiApp = express();

const port = 8888;

apiApp.use(bodyParser.json());

apiApp.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

apiApp.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.htm');
});

apiApp.get('/preme.htm', (req, res) => {
    console.log('preme');
    res.sendFile(__dirname + '/supreme.htm');
})

let reversers = [];
let standBy = new DynamicReverser();
standBy.prepare();

/**
 * Give the cookies for the given pooky url
 */
apiApp.post('/cookies', (req, res) => {
    // todo authentication

    if (req.body.pooky) {
        let dyn;
        for (let reverser of reversers) {
            if (reverser.url == req.body.pooky) {
                // if we've already reversed (or are currently reversing) the desired
                // pooky, use that reverser for performance
                dyn = reverser.reverser;
            }
        }
        if (typeof dyn === 'undefined') {
            if(standBy) {
                // grab a reverser that is ready to have pooky injected
                dyn = standBy;
                // put another on standby
                standBy = new DynamicReverser();
                standBy.prepare();
            } else {
                // rip have to make a new one
                dyn = new DynamicReverser();
            }
            // save a reference the reverser with its pooky url
            reversers.push({
                url: req.body.pooky,
                reverser: dyn
            });

            // stage the new reverser with the pooky url
            dyn.stageCompletely(req.body.pooky);
        }

        dynCookies.manufactureAllCookies(dyn).then(cookies => {
            res.json(cookies);
        }).catch(err => {
            res.end(err);
        })
        // res.end('ok');
    } else {
        res.end('include pooky url {pooky: url}\n' + JSON.stringify(req.body));
    }
});

apiApp.post('/key', (req, res) => {
    let startTime = Date.now();
    console.log(req.body);
    if (req.body.pooky) {
        let dyn;
        // see comments on the key api
        for (let reverser of reversers) {
            if (reverser.url == req.body.pooky) {
                dyn = reverser.reverser;
            }
        }
        if (typeof dyn === 'undefined') {
            if(standBy) {
                dyn = standBy;
                standBy = new DynamicReverser();
                standBy.prepare();
            } else {
                dyn = new DynamicReverser();
            }
            reversers.push({
                url: req.body.pooky,
                reverser: dyn
            })
        }
        dyn.stageCompletely(req.body.pooky);

        dyn.getKey().then(key => {
            res.end(aesjs.utils.hex.fromBytes(key)); // give the key in hex form
        }).catch(err => {
            res.end(err);
        });
    } else {
        res.end('include pooky url {pooky: url}\n' + JSON.stringify(req.body));
    }
})

apiApp.listen(port, () => { console.log(`API listening on port ${port}`) });
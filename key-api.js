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
 * If this is called before /drop, the request will wait
 * (and possible time out) until the drop is detected and
 * pooky is reversed
 */
apiApp.post('/cookies', (req, res) => {
    // todo authentication
    let startTime = Date.now();
    console.log(req.body);
    if (req.body.pooky) {
        let dyn;
        for (let reverser of reversers) {
            if (reverser.url == req.body.pooky) {
                dyn = reverser.reverser;
                console.log('used recycled')
            }
        }
        if (typeof dyn === 'undefined') {
            if(standBy) {
                dyn = standBy;
                standBy = new DynamicReverser();
                standBy.prepare();
                console.log("used standby");
            } else {
                dyn = new DynamicReverser();
                console.log("used new");
            }
            reversers.push({
                url: req.body.pooky,
                reverser: dyn
            });
            dyn.stageCompletely(req.body.pooky).then(() => {
    
            });
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
    // dynCookies.manufactureAllCookies().then(cookies => {
    //     res.json(cookies);
    //     // uncomment next line for benchmark
    //     // console.log(`Manufactured cookies in ${Date.now() - startTime}ms`)
    // })
});

apiApp.post('/key', (req, res) => {
    let startTime = Date.now();
    console.log(req.body);
    if (req.body.pooky) {
        let dyn;
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
                console.log('used standby');
            } else {
                dyn = new DynamicReverser();
                console.log('used new')
            }
            reversers.push({
                url: req.body.pooky,
                reverser: dyn
            })
        }
        dyn.stageCompletely(req.body.pooky).then(() => {

        })

        dyn.getKey().then(key => {
            res.end(aesjs.utils.hex.fromBytes(key));
        }).catch(err => {
            res.end(error);
        })
        // res.end('ok');
    } else {
        res.end('include pooky url {pooky: url}\n' + JSON.stringify(req.body));
    }
})

apiApp.listen(port, () => { console.log(`API listening on port ${port}`) })

const https = require('https');
const fs = require('fs');

https.createServer({
    key: fs.readFileSync('../privkey.pem'),
    cert: fs.readFileSync('../cert.pem'),
    ca: fs.readFileSync('../chain.pem')
}, apiApp)
    .listen(4000, () => { console.log(`https API listening on port 4000`) });
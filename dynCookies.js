// const dyn = require('./dynreverse.js');

const aesjs = require('aes-js');
const uuidv4 = require('uuid/v4');


// dyn.prepare().then(console.log).catch(console.log);

function randomIV() {
    let out = [];
    while (out.length < 16) {
        out.push(Math.floor(Math.random() * 256))
    }
    return new Uint8Array(out);
}

/**
 * Manufactures all the pooky cookies
 * 
 * Resolves with the cookies in json format
 * 
 * To use the resolved cookies:
 * @example for(let cookie in cookies) setCookie(cookie, cookies[cookie])
 */
function manufactureAllCookies(dyn) {
    return new Promise((resolve, reject) => {
        let cookies = {
            'pooky': "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (match) => {
                if (match === 'y') return ['a', 'b', '9', '8'][Math.floor(Math.random() * 4)];
                if (match === 'x') return Math.floor(Math.random() * 16).toString(16);
                return match;
            }),
            'pooky_use_cookie': true,
            'pooky_order_allow': "eyJ0b2hydV9vayI6IHRydWUsImVuYWJsZWQiOiB0cnVlLCJhbGxfcmVsZWFzZXMiOnRydWUsInNwbGF5X2VudiI6InByb2QiLCAibW91c2Vfc2NvcmUiOjEwMCwiYnlwYXNzIjp0cnVlfQ==",
            'updated_pooky_coherence': null,
            'pooky_pooky_coherence': null,
            'pooky_mouse': null,
            'pooky_performance': null,
            'pooky_electric': null,
            'pooky_telemetry': null,
            'pooky_settings': null,
            'pooky_data': null,
            'pooky_recaptcha': null,
            'pooky_recaptcha_coherence': null
        }


        function checkDone() {
            let done = true;
            for (let cookie in cookies) {
                if (cookies[cookie] === null) done = false;
            }
            if (done) {
                resolve(cookies);
            } else if (manufacturers.length > 0) {
                manufacturers.shift()();
            }
        }

        let manufacturers = []

        function updatedCoherence() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            // let toEncrypt = aesjs.utils.utf8.toBytes('pad_PPPPPPP');
            // console.log(toEncrypt);
            console.log(iv);
            let toEncrypt = [ 112, 97, 100, 95, 80, 80, 80, 80, 80, 80, 80 ];
            console.log(toEncrypt);
            dyn.encrypt(iv, toEncrypt).then(output => {
                console.log(output);
                cookies.updated_pooky_coherence = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            });
        }

        function coherence() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            // let diffs = [137, 57, 0, 153, 9, 0, 121, 57, 0, 105, 105, 0, 121, 121, 0, 25, 57, 57, 0, 25, 57, 57, 0, 25, 9, 25, 0, 25, 57, 57, 0, 25, 9, 25, 0, 121, 153, 0, 153, 89, 0, 25, 9, 89, 0, 25, 9, 89, 0, 25, 57, 25, 0, 105, 121, 0];
            let toEncrypt = [];
            // if(Math.random() < 0.5) {
            //     toEncrypt = diffs;
            // } else {
                diffs = [55, 60, 55, 55, 74, 87, 91, 91, 80, 91, 80, 84, 83, 81, 81, 56, 70, 289, 83, 289, 83, 57, 289, 83, 57, 92, 56, 55, 63, 91, 63, 91, 70];
                for (let diff of diffs) {
                    for (let char of '' + diff) {
                        toEncrypt.push(parseInt(char + 9, 16))
                    }
                    toEncrypt.push(0);
                }
            // }
            dyn.encrypt(iv, toEncrypt).then(output => {
                cookies.pooky_pooky_coherence = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            });
        }
        manufacturers.push(coherence);
        manufacturers.push(updatedCoherence);

        function mouse() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            let toEncrypt = [];
            for (let char of '' + Date.now()) {
                toEncrypt.push(parseInt(Math.floor(Math.random() * 9) + char, 16))
            }
            dyn.encrypt(iv, toEncrypt).then(output => {
                cookies.pooky_mouse = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            });
        }
        manufacturers.push(mouse);

        function performance() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            let toEncrypt = [];
            let segments = cookies.pooky.replace(/[^A-Fa-f0-9]/g, '').split("").reverse().join("").match(/.{2}/g);
            for (let segment of segments) {
                toEncrypt.push(parseInt(segment, 16));
            }
            dyn.encrypt(iv, toEncrypt).then(output => {
                cookies.pooky_performance = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            });
        }
        manufacturers.push(performance);

        function electric() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            let toEncrypt = [195];
            dyn.encrypt(iv, toEncrypt).then(output => {
                cookies.pooky_electric = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            }).catch(reason => {
                reject(reason);
            });
        }
        manufacturers.push(electric);

        function data() {
            let iv = randomIV();
            let ivString = aesjs.utils.hex.fromBytes(iv);
            let toEncrypt = [173, 190, 16, 239, 7, 222];
            dyn.encrypt(iv, toEncrypt).then(output => {
                cookies.pooky_data = ivString + aesjs.utils.hex.fromBytes(output);
                checkDone();
            });
        }
        manufacturers.push(data);

        // for(let facturer of manufacturers) {
        //     facturer();
        // }

        for (let cookie in cookies) {
            if (cookie === 'pooky_telemetry' || cookie === 'pooky_settings' ||
                cookie === 'pooky_recaptcha' || cookie === 'pooky_recaptcha_coherence') {
                manufacturers.push(() => {
                    let iv = randomIV();
                    let ivString = aesjs.utils.hex.fromBytes(iv);
                    let toEncrypt = [];
                    while (toEncrypt.length < 16) {
                        toEncrypt.push(Math.floor(Math.random() * 200));
                    }
                    // console.log(toEncrypt)
                    dyn.encrypt(iv, toEncrypt).then(output => {
                        cookies[cookie] = ivString + aesjs.utils.hex.fromBytes(output);
                        checkDone();
                    });
                })

            }
        }
        manufacturers.shift()();
    });
}
module.exports.manufactureAllCookies = manufactureAllCookies;

/**
 * Call this when (or before) the drop starts
 */
function dropStarted(dyn) {
    console.log("Drop started!");
    dyn.stageCompletely(pooky);
}

module.exports.dropStarted = dropStarted;
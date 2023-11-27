const isString = require('is-string-and-not-blank');
const { sendMail } = require('./mail');

if (fetch !== undefined) {
    fetch = require('node-fetch');
}

function getDateString () {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const time = now.getHours() + ':' + now.getMinutes() + ":" + now.getSeconds();
    return `${ day } ${ time }`;
}

function log (message) {
    const dateNow = getDateString();
    console.log(`[${ dateNow }] ${ message }`);
}

function handleServiceWorking (serviceName) {
    log(`Service ${ serviceName } working.`);
}

function getErrorMessageForService (serviceName) {
    return `The service ${ serviceName } is not responding at time ${ getDateString() }`;
}

function handleServiceNotWorking (serviceName) {
    log(`Service ${ serviceName } is not responding. Sending email...`);
    sendMail(getErrorMessageForService(serviceName), serviceName, (err) => {
        if (err) {
            log(`Failed to send email for service ${ serviceName }, error:\n${ err }`);
        }
        else {
            log(`Email sent for service ${ serviceName }`);
        }
    });
}

function parseIntoList (stringVal) {
    return stringVal.split(',').filter(x => isString(x));
}

function spawnWatcher (url, serviceName) {
    const twoMinutesInMilliseconds = 1000 * 60 * 2;
    setInterval(() => {
        fetch(url).then(response => {
            if (response.status < 300 || response.status > 199) {
                handleServiceWorking(serviceName);
            }
            else {
                handleServiceNotWorking(serviceName);
            }
        }).catch(_ => {
            handleServiceNotWorking(serviceName);
        });
    }, twoMinutesInMilliseconds);
}

module.exports = {
    log,
    parseIntoList,
    spawnWatcher
};
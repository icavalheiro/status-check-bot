const isString = require('is-string-and-not-blank');
const { sendMail } = require('./mail');

if (fetch === undefined) {
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

function handleServiceWorking (serviceName, sendBackOnlineEmail, wasOfflineForMinutes) {
    // enable this to flood the logs with "working" logs
    // log(`Service ${ serviceName } working.`);

    if (sendBackOnlineEmail) {
        log(`Service ${ serviceName } working.`);
        log(`✅ Sending email alerting for service ${ serviceName } coming back online after ${ wasOfflineForMinutes } minutes...`);
        sendMail(getBackOnlineMessageForService(serviceName, wasOfflineForMinutes), serviceName, (err) => {
            if (err) {
                log(`Failed to send email for service ${ serviceName }, error:\n${ err }`);
            }
            else {
                log(`Email sent for service ${ serviceName }`);
            }
        });
    }
}

function handleServiceNotWorking (serviceName, sendEmail) {
    log(`❌ Service ${ serviceName } is not responding`);

    if (sendEmail) {
        log(`Sending email alerting for service ${ serviceName } being offline...`);
        sendMail(getErrorMessageForService(serviceName), serviceName, (err) => {
            if (err) {
                log(`Failed to send email for service ${ serviceName }, error:\n${ err }`);
            }
            else {
                log(`Email sent for service ${ serviceName }`);
            }
        });
    }
}

function getErrorMessageForService (serviceName) {
    return `❌ The service ${ serviceName } is not responding at time ${ getDateString() }`;
}

function getBackOnlineMessageForService (serviceName, timeSpentOfflineMinutes) {
    return `✅ The service ${ serviceName } is back online. It was offline for ${ timeSpentOfflineMinutes } minutes.`;
}

function parseIntoList (stringVal) {
    return stringVal.split(',').filter(x => isString(x));
}

function spawnWatcher (url, serviceName) {
    const twoMinutesInMilliseconds = 1000 * 60 * 2;
    let isWorking = true;
    let offlineSince = null;

    const handleSuccess = () => {
        if (!isWorking) {
            //service back online \o/
            isWorking = true;
            const elapsedTimeOfflineSeconds = ((new Date().getTime()) - offlineSince.getTime()) / 1000;
            offlineSince = null;
            handleServiceWorking(serviceName, true, elapsedTimeOfflineSeconds / 60);
        }
        else {
            //service keeps online
            handleServiceWorking(serviceName, false, null);
        }
    };

    const handleFailure = () => {
        if (isWorking) {
            //service just died :(
            isWorking = false;
            offlineSince = new Date();
            handleServiceNotWorking(serviceName, true);
        }
        else {
            //service still dead
            handleServiceNotWorking(serviceName, false);
        }
    };

    //start the async checks
    setInterval(() => {
        fetch(url).then(response => {
            if (response.status < 300 && response.status > 199) {
                try {
                    handleSuccess();
                }
                catch (e) {
                    console.log("ERROR: " + e);
                }
            }
            else {
                handleFailure();
            }
        }).catch(_ => {
            handleFailure();
        });
    }, twoMinutesInMilliseconds);
}

module.exports = {
    log,
    parseIntoList,
    spawnWatcher
};
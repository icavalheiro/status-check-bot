const fs = require('fs');
if (fs.existsSync('./.env')) {
    require('dotenv').config();
}

require('dotenv').config({ path: "../cadburyai_production/.env" });

const { log, parseIntoList, spawnWatcher } = require('./functions');

if (process.env.FAKE_EMAIL_SUBMISSION == "true") {
    log("ATTENTION: FAKE EMAIL SUBMISSION SET TO TRUE, this should be used for debug only");
}

let urls = parseIntoList(process.env.URLS_TO_CHECK);
let serviceNames = parseIntoList(process.env.SERVICE_NAMES_URLS_TO_CHECK);

if (urls.length != serviceNames.length) {
    log("ERROR: URLS_TO_CHECK does not have the service names set properly" +
        " in the SERVICE_NAMES_URLS_TO_CHECK env var, make sure each URL has a name set");

    return;
}

log("Starting watchers...");
for (let i = 0; i < urls.length; i++) {
    log(`Starting watcher for ${ serviceNames[ i ] }`);
    spawnWatcher(urls[ i ], serviceNames[ i ]);
}

log("Watchers started");
log("Status: OK (running)");


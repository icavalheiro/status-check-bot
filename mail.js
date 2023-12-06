const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMail (text, serviceName, callback) {
    if (process.env.FAKE_EMAIL_SUBMISSION == "true") {
        console.log("WARNING FAKE EMAIL SET TO TRUE, message that was supposed to be send is: \n" + text);
        callback();
        return;
    }

    let to = process.env.SEND_TO_EMAILS;
    if (to.includes(';')) {
        to = to.split(';');
    }
    const msg = {
        to,
        from: process.env.FROM_EMAIL,
        subject: serviceName + " | " + process.env.EMAIL_SUBJECT,
        text,
    };

    sgMail.send(msg).then(() => {
        callback();
    }, error => {
        callback(error);
    });
}

module.exports = {
    sendMail
};
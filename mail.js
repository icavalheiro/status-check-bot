const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendMail (text, serviceName, callback) {
    const msg = {
        to: process.env.SEND_TO_EMAILS,
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

function MailTransporter(){
    return {
        host: process.env.WEB_MAIL_HOST,
        port: process.env.WEB_MAIL_PORT,
        secure: true,
        auth: {
            user: process.env.WEB_MAIL_ADDRESS,
            pass: process.env.WEB_MAIL_PASS
        }
    };
}
function MailOptions(toMail, subjectMessage, htmlBody){
    return {
        from: process.env.WEB_MAIL_ADDRESS,
        to: toMail,
        subject: subjectMessage,
        html: htmlBody
    };
}
module.exports = {MailTransporter, MailOptions}
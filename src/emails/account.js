const sgMail = require('@sendgrid/mail')
const nconf = require('nconf')

nconf.use('file', {file: './config/dev.json'})
const sendGridAPIKey = nconf.get('sendGridAPIKey')

sgMail.setApiKey(sendGridAPIKey)


const sendWelcomeEmail = (email, name) => {
    try {
        console.log('sending mail')
        sgMail.send({
            to: email,
            from: 'rachitrampal05@gmail.com',
            subject: 'WELCOME TO THE APP',
            text: `Hi ${name}. Please share your experience`,
        })
    } catch (e) {
        console.log(e)
    }
}

const cancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rachitrampal05@gmail.com',
        subject: 'SORRY! For loosing you',
        text: `Hi ${name}. Please share your experience`,
    })
}

module.exports = {sendWelcomeEmail, cancellationEmail}
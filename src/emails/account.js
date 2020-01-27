const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
    try {
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
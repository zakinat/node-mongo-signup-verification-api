const nodemailer = require('nodemailer')
const smtpOptions=require('./smtpOptions')

const dotenv=require('dotenv')

//Load config
dotenv.config({path:'./_config/config.env'})


async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM}) {
    const transporter = nodemailer.createTransport(smtpOptions)
    await transporter.sendMail({ from, to, subject, html })
}
module.exports = {sendEmail}
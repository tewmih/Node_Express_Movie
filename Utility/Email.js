const nodemail=require('nodemailer')
const sendEmail = async (options) => {
    let transporter=nodemail.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
   
    const emailOptions={
        from:process.env.EMAIL_FROM,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    transporter.sendMail(emailOptions)

}
module.exports = sendEmail

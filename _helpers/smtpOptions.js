const dotenv=require('dotenv')

//Load config
dotenv.config({path:'./_config/config.env'})

module.exports=smtpOptions={
host:process.env.SMTP_HOST,
port:process.env.SMTP_PORT,
auth:{
    user:process.env.SMTP_AUTH_USER,
    pass:process.env.SMTP_AUTH_PASS
}
}
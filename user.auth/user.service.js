const {sendEmail}=require('../_helpers/send-email')
const RefreshToken=require('./refresh-token.model')
const {randomTokenString}=require('../_helpers/crypto')


const sendVerificationEmail=async(user, origin)=> {
    let message
    if (origin) {
        const verifyUrl = `${origin}/api/auth/verify-email?token=${user.verificationToken}`
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/api/auth/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    })
}

const sendPasswordResetEmail=async(user,origin)=>{
    let message
    if (origin) {
        const resetUrl = `${origin}/api/auth/reset-password?token=${user.resetToken.token}`
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/api/auth/reset-password</code> api route:</p>
                   <p><code>${user.resetToken.token}</code></p>`
    }

    await sendEmail({
        to: user.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    })
}

const setTokenCookie=(res, token)=> {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    }
    res.cookie('refreshToken', token, cookieOptions)
}

const  generateRefreshToken=(user, ipAddress)=> {
    // create a refresh token that expires in 7 days
    return  new RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    })
}

const getRefreshToken=async(token)=>{
    const refreshToken = await RefreshToken.findOne({ token }).populate('user')
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token'
    return refreshToken
}

const updateRfreshToken=(refreshToken,ip)=>{
    refreshToken.oldToken=refreshToken.token
    refreshToken.token=randomTokenString()
    refreshToken.expires=new Date(Date.now() + 7*24*60*60*1000)
    refreshToken.loginIp=ip
    return refreshToken
}

const basicDetails=(user)=>{
    const { id, firstName, lastName, email, role, created, updated, isVerified } = user
    return { id, firstName, lastName, email, role, created, updated, isVerified }
}
module.exports={sendVerificationEmail,setTokenCookie,generateRefreshToken,getRefreshToken,sendPasswordResetEmail,basicDetails,updateRfreshToken}
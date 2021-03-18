const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const crypto = require("crypto")
const dotenv=require('dotenv')
//Load config
dotenv.config({path:'./_config/config.env'})

const hash=async(needtohash)=>{
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(needtohash, salt)
    return hash
}


const generateJwtToken=(user)=> {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ id: user.id}, process.env.JWT_SECRET, { expiresIn: '15m' })
}
const randomTokenString=()=>{
    return crypto.randomBytes(40).toString('hex')
}

module.exports={hash,generateJwtToken,randomTokenString}

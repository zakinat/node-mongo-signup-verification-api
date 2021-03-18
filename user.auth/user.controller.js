//importing dependencies
const bcrypt=require('bcryptjs')
const dotenv=require('dotenv')
//importing the model of data that would send to the server 
const User=require('./user.model')
const RefreshToken=require('./refresh-token.model')
const Role=require('../_helpers/role')

//import functions
const {generateJwtToken,randomTokenString,hash} =require('../_helpers/crypto')
const {sendVerificationEmail,setTokenCookie,generateRefreshToken,getRefreshToken,sendPasswordResetEmail,basicDetails,updateRfreshToken} =require('./user.service')
//Load config
dotenv.config({path:'./_config/config.env'})

// @desc  Register a user  
// @route Post /api/auth/signup
//@access public
const signUp=async(req,res)=>{
    const { firstName,lastName, email, password } = req.body
    const ipAddress = req.ip
    const origin =req.get('origin')
    try {
      const user = await User.findOne({ email })
      if (user) throw Error('User already exists')
  
      const hashedPass=await hash(password)
      if (!hashedPass) throw Error('Something went wrong hashing the password')

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPass
      })
  // first registered account is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0
    newUser.role=isFirstAccount? Role.Admin : Role.User

    newUser.verificationToken =await randomTokenString()

      const savedUser = await newUser.save()
      if (!savedUser) throw Error('Something went wrong saving the user')
  
      const token = generateJwtToken(savedUser)
      const refreshToken = generateRefreshToken(savedUser, ipAddress)
    // save refresh token
      await refreshToken.save()
      setTokenCookie(res, refreshToken.token)

      // send email
await sendVerificationEmail(savedUser, origin)

      res.status(200).json({
        token,
        user:{...basicDetails(savedUser)},
        msg:'Registration successful, please check your email for verification instructions'
      })
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
}

// @desc  verify a user  
// @route Post /api/auth/verify-email
//@access protected
const verifyEmail=async(req,res)=>{
const {token}=req.body
try {
  const user = await User.findOne({ verificationToken: token })
  if (!user) throw Error('Verification failed')
    user.verified = Date.now()
    user.verificationToken = undefined
    await user.save()
    res.status(200).json({ msg: 'Verification successful, you can now login' })

} catch (e) {
  res.status(400).json({ error: e.message })
}}

// @desc  log in a user  
// @route Post /api/auth/signin
//@access public
const signIn=async(req,res)=>{
    const { email, password } = req.body
    const ipAddress = req.ip
  try {
    // Check for existing user
    const user = await User.findOne({ email })
    if (!user) throw Error('User does not exist')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw Error('password wrong')
// authentication successful so generate jwt and refresh tokens
    const token = generateJwtToken(user)
    if (!token) throw Error('Couldnt sign the token')
    const hasRefreshToken= await RefreshToken.findOne({user:user.id})
    if (hasRefreshToken.revoked) throw Error('User revoked')
    let refreshToken =hasRefreshToken || generateRefreshToken(user, ipAddress)
    if(hasRefreshToken || refreshToken.isExpired){
      refreshToken=updateRfreshToken(refreshToken,ipAddress)
    }
    // save refresh token
    await refreshToken.save()
    setTokenCookie(res, refreshToken.token)
    res.status(200).json({
      token,
      user: {...basicDetails(user)}
    })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// @desc  refresh a user token  
// @route Post /api/auth/refresh-token
//@access protected with cookies
const refreshToken=async(req,res)=>{
    const tokenCookies = req.cookies.refreshToken
    if(!tokenCookies) throw Error('Invalid credentials')
    const ipAddress = req.ip
  try {
    let refreshToken = await getRefreshToken(tokenCookies)
    const { user } = refreshToken
    if(!user) throw Error('user invailed')
    
// replace old refresh token with a new one and save
refreshToken =updateRfreshToken(refreshToken,ipAddress)
    await refreshToken.save()
    
// generate new jwt
    const token= generateJwtToken(user)

    setTokenCookie(res, refreshToken.token)
res.status(200).json({
  token,
  user: {...basicDetails(user)},  
})
} catch (e) {
    res.status(400).json({ error: e.message })
  }
}

// @desc  revoke a user token  
// @route Post /api/auth/revoke-token
//@access private
const revokeToken=async(req,res)=>{
 // accept token from request body or cookie
 const token =  req.cookies.refreshToken
 const ipAddress = req.ip
 if (!token) throw Error('Invalid token')
 try {
  let refreshToken = await getRefreshToken(token)
  const {user:userRequester} =refreshToken
 // users can revoke their own tokens and admins can revoke any tokens
 if (req.body.id && req.body.id !== req.user.id && req.user.role !== Role.Admin) 
    throw Error('Invalid Credintial')

let revokeduser=userRequester
if (req.body.id){
   refreshToken=await RefreshToken.findOne({user:req.body.id}).populate('user')
   const {user:revokedUserById} =refreshToken
   revokeduser=revokedUserById
}
revokeduser.revoked=Date.now()
await revokeduser.save()
  // revoke token and save
  refreshToken.revoked = Date.now()
  refreshToken.revokedByIp = ipAddress
  refreshToken.revokedByuser=userRequester.email
  await refreshToken.save()
  res.status(200).json({ msg: 'Token revoked' })
 } catch (e) {
  res.status(400).json({ error: e.message })
 }
}


// @desc  get a user  
// @route Get /api/auth/user/id
//@access private
const getUserData=async(req,res)=>{
    try {
        
        const askedUser = await User.findById(req.params.id).select('-password')
        if (!askedUser ) throw Error('User does not exist')
        // users can get their own account and admins can get any account
        if (req.user.id!=req.params.id && req.user.role!=Role.Admin)
        {
          res.status(400).json( 'Access Denied')
        }
        else{res.status(200).json({...basicDetails(askedUser)})}
        
      } catch (e) {
        res.status(400).json({ error: e.message })
      }
}

// @desc  forget a password  
// @route Post /api/auth/forgot-password
//@access public
const forgotPassword=async(req,res)=>{
const origin =req.get('origin')
const {email} =req.body
try {
  const user =await User.findOne({email})
  // always return ok response to prevent email enumeration
  if (!user) throw Error('User does not exist')
  if(user.revoked) throw Error('User revoked')
  // create reset token that expires after 24 hours
  user.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24*60*60*1000)
}
await user.save()
// send email
await sendPasswordResetEmail(user, origin)
res.status(200).json({ msg: 'Please check your email for password reset instructions' })
} catch (e) {
  res.status(400).json({ error: e.message })
}}

// @desc  reset a password  
// @route Post /api/auth/reset-password
//@access protected with crypto url
const resetPassword=async(req,res)=>{
  const {token,newPassword}=req.body
  try {
    const user = await User.findOne({
      'resetToken.token': token
  })
  if (!user || Date.now()>=user.resetToken.expires) throw Error('Invalid token')
  const hashedPass=await hash(newPassword)
 if (!hashedPass) throw Error('Something went wrong hashing the password')
user.password=hashedPass
user.passwordReset = Date.now()
user.resetToken = undefined
await user.save()
res.status(200).json({ msg: 'password reset' })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }}

// @desc  get users 
// @route Post /api/auth/users
//@access private Admin
  const getAllUsers=async(req,res)=>{
    try {
      const users = await User.find()
     const basicDetailUsers=users.map(x => basicDetails(x))
     res.status(200).json(basicDetailUsers)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
    
  }
  // @desc  create users 
// @route Post /api/auth/create-user
//@access private Admin
  const createUser=async(req,res)=>{
    const { firstName,lastName, email, password,role } = req.body
    try {
      const user = await User.findOne({ email })
      if (user) throw Error('User already exists')
  
 const hashedPass=await hash(password)
 if (!hashedPass) throw Error('Something went wrong hashing the password')

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPass,
        role,
        verified : Date.now()
      })
      const savedUser = await newUser.save()
      if (!savedUser) throw Error('Something went wrong saving the user')

      res.status(200).json({
        user: {...basicDetails(savedUser)},
        msg:'adding user successfuly'
      })
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  }

    // @desc  update user
// @route Put /api/auth/user/:id
//@access private 
  const updateUser=async(req,res)=>{
    const params = req.body
    let user=null
    try {
      if(req.params.id !== req.user.id && req.user.role === Role.Admin)
      {
         user = await User.findById(req.params.id).select('role')
        if (!user ) throw Error('User does not exist')

      }else if (req.params.id === req.user.id){
         user = await User.findById(req.params.id)
        if (!user ) throw Error('User does not exist')
        const isMatch = await bcrypt.compare(params.password, user.password)
        if (!isMatch) throw Error('Invalid credentials')
// validate (if email was changed)
        if (params.email && user.email !== params.email && await User.findOne({email: params.email})) {
        throw Error('Email "' + email + '" is already taken')
          }

// hash password if it was entered
if (params.newPassword) {
  params.password = hash(params.newPassword)
  delete params.newPassword
}}else{
  return res.status(401).json({ msg: 'Unauthorized' })
}
// copy params to account and save
delete params.password
Object.assign(user, params)
user.updated=Date.now()
  await user.save()
  res.status(200).json({...basicDetails(user)})
    } catch (e) {
      res.status(400).json({ error: e.message })
    }}
// @desc  delete a  user
// @route Delete /api/auth/user/:id
//@access private 
const deleteUser=async(req,res)=>{
// users can delete their own account and admins can delete any account
if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
  return res.status(401).json({ msg: 'Unauthorized' })
}
try {
  const user = await User.findById(req.params.id)
  if (!user ) throw Error('User does not exist') 
  await user.remove()
  const refreshToken=await RefreshToken.findOne({user:req.params.id})
  await refreshToken.remove()
  res.status(200).json({ msg: 'Account deleted successfully' })
} catch (e) {
  res.status(400).json({ error: e.message })
}
    }
module.exports={signUp,signIn,getUserData,verifyEmail,refreshToken,revokeToken,forgotPassword,resetPassword,getAllUsers,createUser,updateUser,deleteUser}
//exporting to "/routes/stories.js"


const jwt=require('jsonwebtoken')
const dotenv=require('dotenv')
const User=require('../user.auth/user.model')
const role=require('../_helpers/role')

//Load config
dotenv.config({path:'../_config/config.env'})

const auth= async(req, res, next) => {
  
  const token = req.header('x-auth-token')

  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'No token, authorization denied' })

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Add user from payload
    req.user = decoded
    const user=await User.findById(req.user.id)
    req.user.role=user.role
    
    next()
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' })
  }
}

const isAdmin=async(req,res,next)=>{
  try {
    const user=await User.findById(req.user.id)
    if((user.role===role.Admin)){
     next()
    }
    else{
      res.status(400).json({ msg: 'admin auth error' })
    }

  } catch (err) {
    res.status(400).json({ msg: 'admin auth error' })
  }

}

module.exports={auth,isAdmin}

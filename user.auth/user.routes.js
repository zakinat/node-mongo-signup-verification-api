//importing dependencies
const router=require('express').Router()

//importing functions
const {signUp,signIn,getUserData,verifyEmail,refreshToken,revokeToken,forgotPassword,resetPassword,getAllUsers,createUser,updateUser,deleteUser}=require('./user.controller')
const {signUpSchema,signInSchema,verifyEmailSchema,revokeTokenSchema,forgotPasswordSchema,resetPasswordSchema,createSchema,updateSchema}=require('./user.middlewares')
const {auth,isAdmin}=require('../_middleware/authJWT')



//declaring routes
// @route  /api/auth

  
//@access public
router.post('/signup',signUpSchema,signUp)
router.post('/signin',signInSchema,signIn)
router.post('/forgot-password', forgotPasswordSchema, forgotPassword)
//@access protected by refresh token or crypto url
router.post('/verify-email', verifyEmailSchema, verifyEmail)
router.post('/refresh-token', refreshToken)
router.post('/reset-password', resetPasswordSchema, resetPassword)

//@access private
router.get('/user/:id',auth,getUserData)
router.put('/user/:id', auth, updateSchema, updateUser)
router.delete('/user/:id', auth, deleteUser)
router.post('/revoke-token',auth,revokeTokenSchema, revokeToken)

//@access Admin
router.get('/users', auth,isAdmin, getAllUsers)
router.post('/create-user', auth,isAdmin, createSchema, createUser);

module.exports=router
//exporting to "server.js"
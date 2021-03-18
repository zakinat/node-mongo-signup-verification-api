const Joi = require('joi')
const validateRequest=require('../_middleware/validate-request')
const Role=require('../_helpers/role')



//validate schema
const signUpSchema=(req, res, next)=> {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    validateRequest(req, next, schema)
}

const signInSchema=(req, res, next)=> {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    })
    validateRequest(req, next, schema)
}

const verifyEmailSchema=(req, res, next)=> {
    const schema = Joi.object({
        token: Joi.string().required()
    })
    validateRequest(req, next, schema)
}

const revokeTokenSchema=(req, res, next)=>{
    const schema = Joi.object({
        id: Joi.string().empty('')
    })
    validateRequest(req, next, schema)
}

const  forgotPasswordSchema=(req, res, next)=> {
    const schema = Joi.object({
        email: Joi.string().email().required()
    })
    validateRequest(req, next, schema)
}

const resetPasswordSchema=(req, res, next)=>{
    const schema = Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string().min(6).required(),
        //confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    })
    validateRequest(req, next, schema)
}

const createSchema=(req, res, next)=>{
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().required()
    })
    validateRequest(req, next, schema)
}

const updateSchema=(req,res,next)=>{
    const schemaRules = {
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        newPassword: Joi.string().min(6).empty(''),
        
    }

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().empty('')
    }

    const schema = Joi.object(schemaRules)
    validateRequest(req, next, schema)

}

module.exports={signUpSchema,signInSchema,verifyEmailSchema,revokeTokenSchema,forgotPasswordSchema,resetPasswordSchema,createSchema,updateSchema}
const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    firstName:{
      type:String,
      required:true,
    },
    lastName:{
      type:String,
      required:true,
    },
    email: {
      type:String,
      required:true,
      unique:true
    },
    password: {
      type:String,
      required:true,
      max:1024,
      min:6
    },
    role: 
      {
        type:String,
        required:true,
      },
    verificationToken: String,
    verified: Date,
    resetToken: {
        token: String,
        expires: Date
    },
    passwordReset: Date,
    regdate:{
      type:Date,
      default:Date.now
    },
    updated: Date,
    revoked:Date
  })


userschema.virtual('isVerified').get(function () {
  return !!(this.verified || this.passwordReset)
})
userschema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      // remove these props when object is serialized
      delete ret._id;
      delete ret.passwordHash;
  }
})

module.exports = mongoose.model("User",userschema)
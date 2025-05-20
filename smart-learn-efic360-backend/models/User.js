// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken')
const crypto=require('crypto')

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true,'Please Enter Your Full Name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true,'Please Enter Your Email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true,"please Enter a Password"],
  },

  nic: {
    type: String,
    trim: [true,"please Enter a NIC"],
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  parentName: {
    type: String,
    trim: true,
  },
  parentPhone: {
    type: String,
    trim: true,
  },
  gradeId: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String, // store filename or file path
  },
  subject: { type: String },
  qualifications: { type: String },
  childrenName: { type: String },
  work: { type: String },
  gender: { type: String },
  role: {
    type: String,
    enum: ['student',  'parent','teacher', 'admin'],
    default: 'student',
  },
    isApproved: {
    type: Boolean,
    default: false, //  Newly added and placed correctly
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    isvalidEmail:{
        type:Boolean,
        default:false
    },
   emailValidationToken:String, 
    emailValidationTokenExpire:Date
});



// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.getJwtToken= function(){
    return jwt.sign({id:this.id,role:this.role,email:this.email},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.isValidPassword= async function(enteredPassword)
{
    return await bcrypt.compare(enteredPassword,this.password)
}

userSchema.methods.getResetPasswordToken=function(){
    
    //generate token
    const token=crypto.randomBytes(20).toString('hex')

    // to make hashed toke and set resetPasswordToken and resetPasswordExpire
    this.resetPasswordToken=crypto.createHash('sha256').update(token).digest('hex')
    this.resetPasswordTokenExpire=new Date(Date.now()+ 30*60*60*1000)

    return token;

}
userSchema.methods.getEmailValidationToken=function(){
    
    //generate token
    const token=crypto.randomBytes(20).toString('hex')

    // to make hashed toke and set resetPasswordToken and resetPasswordExpire
    this.emailValidationToken=crypto.createHash('sha256').update(token).digest('hex')
    this.emailValidationTokenExpire=new Date(Date.now()+ 3*24*60*60*1000)

    return token;

}

const User = mongoose.model('User', userSchema);

module.exports = User;

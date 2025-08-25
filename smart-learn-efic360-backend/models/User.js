// models/User.js
const mongoose = require('mongoose');
const validator = require('validator');
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
      validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true,"please Enter a Password"],
  },


  dateOfBirth: {
    type: Date,
  },
  address:
   {
       number:{type:String,required:[true,'Please Enter Your Address no']},
       street:{type:String,required:[true,'Please Enter Street']},
       city:{type:String,required:[true,'Please Enter your city']},
       district:{type:String,required:[true,'Please Enter Your District']},
       postalCode:{type:Number,required:[true,'Please Enter Your Postal Code']}
   },
 

 
  profileImage: {
    type: String, // store filename or file path
  },
  
  gender: { type: String },
//   role: {
//     type: String,
//     enum: ['student',  'parent','teacher', 'admin'],
//     default: 'student',
//   },
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
}, {
  discriminatorKey: 'role',   // << this makes "role" the official key
  collection: 'users'
});

const studentSchema = new mongoose.Schema(
  {
    parentnic: {
        type: String,
        unique: [true, 'NIC should be unique'],
        default: "",
        validate: {
            validator: function (value) {
                const trimmedValue = value.trim();
                
                if (/^\d{12}$/.test(trimmedValue) || (trimmedValue.endsWith('v') && trimmedValue.length === 10)) {
                    return true;
                }
    
                return false;
            },
            message: 'Please enter a valid NIC with either 12 digits or a 10-character string ending with "v".'
        }
    },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    gradeId: { type: String, required: true },
    
  },
  { discriminatorKey: 'role', _id: false }
); 


//create seperate models for each role
const adminSchema=new mongoose.Schema({
    adm_id: {
        type: String,
        default: "",
        validate: {
            validator: function (value) {
                return this.role === 'Admin' ? value !== "" : true;
            },
            message: 'Please enter your valid Admin id',
        },
    },
    title: {
        type: String,
        default: "",
        validate: {
            validator: function (value) {
                return this.role === 'Admin' ? value !== "" : true;
            },
            message: 'Please enter your valid your Title',
        },
    }
,
}, {
    discriminatorKey: 'role',
    _id: false, // to disable automatic _id generation for discriminator models
})

const teacherSchema=new mongoose.Schema({
  nic: {
        type: String,
        unique: [true, 'NIC should be unique'],
        default: "",
        validate: {
            validator: function (value) {
                const trimmedValue = value.trim();
                
                if (/^\d{12}$/.test(trimmedValue) || (trimmedValue.endsWith('v') && trimmedValue.length === 10)) {
                    return true;
                }
    
                return false;
            },
            message: 'Please enter a valid NIC with either 12 digits or a 10-character string ending with "v".'
        }
    },
   
   
   
    
    phone:{
        type:String,
        required:[true,'Please enter phone number'],
        validate:[validator.isMobilePhone,'Please Enter valid phone number']//+94 77 123 3243
    },
   
    subject: { type: String },
    qualifications: { type: String }




},{
    discriminatorKey: 'role',
    _id: false, // to disable automatic _id generation for discriminator models
})

const parentSchema=new mongoose.Schema({
 
  childrenName: { type: String },
  work: { type: String },
  gender: { type: String },

  parentnic: {
        type: String,
        unique: [true, 'NIC should be unique'],
        default: "",
        validate: {
            validator: function (value) {
                const trimmedValue = value.trim();
                
                if (/^\d{12}$/.test(trimmedValue) || (trimmedValue.endsWith('v') && trimmedValue.length === 10)) {
                    return true;
                }
    
                return false;
            },
            message: 'Please enter a valid NIC with either 12 digits or a 10-character string ending with "v".'
        }
    },
  
 
  parentPhone: {
    type: String,
    trim: true,
  },
  
  profileImage: {
    type: String, // store filename or file path
  }

},{
    discriminatorKey: 'role',
    _id: false, // to disable automatic _id generation for discriminator models
})

// Hash password before saving
userSchema.pre('save',async function (next){
    try {
        this.fullName=this.fullName.toUpperCase();
        
        if(!this.isModified('password')) return next()
        this.password=await bcrypt.hash(this.password,10)//to hash the password
       return next()
        
    } catch (error) {
        next(error)
    }
})

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

const Student = User.discriminator(
  'Student',             // model name (can stay capitalized)
  studentSchema,
  'student'              // value stored in discriminatorKey field
);

const Teacher = User.discriminator('Teacher', teacherSchema, 'teacher');
const Parent  = User.discriminator('Parent', parentSchema, 'parent');
const Admin   = User.discriminator('Admin', adminSchema, 'admin');


module.exports = {
  User,
  Student,
  Admin,
  Teacher,
  Parent
};
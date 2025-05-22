const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendmail = require('../utils/emailHelper');
const sendToken = require('../utils/jwtHelper');

// Register new user
const register = asyncHandler(async (req, res,next) => {
  const { role, email, password, confirmPassword } = req.body;

  if (!role || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'Email already registered.' });

  const user = new User({
    ...req.body
  });

  // Create email verification token
  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000; // 1 hour

  await user.save();

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.firstname || ''} ${user.lastname || ''},
    Please verify your email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
    If you did not register, please ignore this email.
  `;
  

  try {
    await sendmail({
      email: user.email,
      subject: 'Verify your email - Smart Learn EFIC 360',
      message,
    });
    const roleMessage = user.role === 'admin'
      ? 'Admin Dashboard'
      : 'Registration successful. Please verify your email and wait for admin approval.';

    sendToken(user, 201, res, roleMessage);
  } catch (error) {
    user.emailValidationToken = undefined;
    user.emailValidationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'Could not send verification email.' });
  }
 

});
// const register=asyncHandler(async(req,res,next)=>{  
//   try {  
//     const{role}=req.body
//     if(role!=='Google User'){ 
//     if(req.files){
//       req.body.profile=`${process.env.BACK_END_URL}/uploads/users/${encodeURI(req.files['profile'][0].filename)}`
      
//     }

//     //Duplicate data find
//     const duplicate1=await User.findOne({email:req.body.email}).lean()

//     if (duplicate1) {
//         return res.status(409).json({ message: 'Duplicate email' })
//     }
    
//      //cofirm password
//      if(req.body.password!==req.body.confirmPassword) return res.status(409).json({message:"Password is not matched"})

//     //create data based on role
//     var user;
//     if(role==="Admin")
//     {
//          user=await Admin.create(req.body)
//     }
//     else if(role==="teacher")
//     {
          
//          user=await teacher.create(req.body) // need to verify by Admin after status will uptaded
  
//          //await Processing.create(user.findOne({email:user.email})) // need to verify by Admin after status will uptaded
//     }    
//     else if(role==="parent")
//     {
//          user=await parent.create(req.body)  
//     }

//     else{
//          user=await User.create(req.body) 
//     }

//     if(!user)
//     {
//         return res.status(400).json({message:"There is no user to create"})

//     }
//     else{
//         try {

//           //get token
//           const token=await user.getEmailValidationToken();
//           //save user to save emailValidationToken field and emailValidationTokenExpire field
//           await user.save({validateBeforeSave:false})
      
//           //create URL
//          /* const resetURL=`${req.protocol}://${req.get('host')}/SiteSupplyCraft/email/verify/${token}` */
//             const resetURL=`${process.env.FROND_END_URL}/email/verify/${token}`
//           const message = `Hi ${user.firstname} ${user.lastname},\n\n
//                           We just need to verify your email address before you can access your Account.
//                           <a href="${resetURL}"><button style="padding: 10px; background-color: #3498db; color: #ffffff; border-radius: 5px; cursor: pointer;">Verify Email</button></a>
//                           \n\n
//                           Thanks! – The Site Supply Craft team
//                           \n\n If you have not requested this email, then ignore it.`;
      
//           await sendmail(
//               {
//                   email:user.email,
//                   subject:"EMAIL VERIFICATION",
//                   message
//               }
//           )
//           sendToken(user,201,res,`Email sent to your ${user.email} to Verify Your Email`)
      
//          } catch (error) {
//           user.emailValidationToken=undefined
//           user.emailValidationTokenExpire=undefined
//           await user.save({validateBeforeSave:false})
//            res.status(500).json({success:"fail",message:error.message})
//          }
      
//     }
//   } 
//   else if(role==='Google User')
//   {
    
//     const duplicate=await GoogleUser.findOne({email:req.body.email}).lean()
//     if(duplicate)
//     { 
//       const { token, ...userData } = req.body;
//       const user = await GoogleUser.findOneAndUpdate({ email: req.body.email }, userData, { new: true });      
//       sendToken(user,201,res,null,true)
    
//     }
//     else{
//       const { token, ...userData } = req.body;
//       const user = await GoogleUser.create(userData);
//       sendToken(user,201,res,null,true)
//     }


//   }

//   } catch (error) {
//         if (error.name === 'ValidationError') {
//           // Handle Mongoose validation errors
//           const validationErrors = {};
//           for (const field in error.errors) {
//             validationErrors[field] = error.errors[field].message;
//           }
//           return res.status(400).json({ success: 'Fail', errors: validationErrors });
//         } else {
//           console.error(error);
//           res.status(400).json({ success: 'Error', message:error.message });
//         }
//       }

// }

// )



// Verify Email
// const verifyEmail = asyncHandler(async (req, res) => {
//   const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

//   const user = await User.findOne({
//     emailValidationToken: hashedToken,
//     emailValidationTokenExpire: { $gt: Date.now() },
//   });

//   if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

//   user.isValidEmail = true;
//   user.emailValidationToken = undefined;
//   user.emailValidationTokenExpire = undefined;
//   await user.save({ validateBeforeSave: false });

//   sendToken(user, 200, res, 'Email successfully verified.');
// });

const verifyEmail=asyncHandler(async(req,res)=>{
  try {
    const hasedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({
      emailValidationToken:hasedToken,
      emailValidationTokenExpire:
        {
          $gt:new Date()
        }
      })
      if(!user)
      {
        return res.status(400).json({message:"Email Verification token is invalid or expired"})
      }
      user.isvalidEmail=true;
      user.emailValidationToken=undefined
      user.emailValidationTokenExpire=undefined
      await user.save({validateBeforeSave:false})
      sendToken(user, 201, res,'Successfully verified your Email')
  } catch (err) {
    res.status(400)
    .json({
        success:false,
        message:err.message
    })
  }
})

// Resend Verification Email
// const resendVerificationEmail = asyncHandler(async (req, res) => {
//   const user = req.user;

//   if (user.isValidEmail) return res.status(400).json({ message: 'Email already verified.' });

//   const emailToken = crypto.randomBytes(20).toString('hex');
//   user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
//   user.emailValidationTokenExpire = Date.now() + 3600000;
//   await user.save({ validateBeforeSave: false });

//   const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
//   const message = `
//     Hi ${user.firstname || ''} ${user.lastname || ''},
//     Please verify your email by clicking the link below:
//     <a href="${verificationUrl}">Verify Email</a>
//   `;

//   try {
//     await sendmail({
//       email: user.email,
//       subject: 'Verify your email - Smart Learn EFIC 360',
//       message,
//     });
//     res.status(200).json({ message: 'Verification email resent.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Could not send verification email.' });
//   }
// });

const resendVerificationEmail=asyncHandler( async (req,res)=>{
  const user=req.user
  //Resending a verification mail
  try {
    //get token
    const token=await user.getEmailValidationToken();
    //save user to save emailValidationToken field and emailValidationTokenExpire field
    await user.save({validateBeforeSave:false})
    console.log(user)

    //create URL
    /* const resetURL=`${req.protocol}://${req.get('host')}/SiteSupplyCraft/email/verify/${token}` */
    const resetURL=`${process.env.FROND_END_URL}/email/verify/${token}`
    const message = `Hi ${user.firstname} ${user.lastname},\n\n
                    We just need to verify your email address before you can access your Account.
                    <a href="${resetURL}"><button style="padding: 10px; background-color: #3498db; color: #ffffff; border-radius: 5px; cursor: pointer;">Verify Email</button></a>
                    \n\n
                    Thanks! – The Site Supply Craft team
                    \n\n If you have not requested this email, then ignore it.`;

    await sendmail(
        {
            email:user.email,
            subject:"EMAIL VERIFICATION",
            message
        }
    )
    res.status(200).json({
        success: true,
        message: `Email sent to your ${user.email} to Verify Your Email again`
    })

   } catch (error) {
    user.emailValidationToken=undefined
    user.emailValidationTokenExpire=undefined
    await user.save({validateBeforeSave:false})
     res.status(500).json({success:"fail",message:error.message})
   }  
})

// Change User Email
const changeUserEmail = asyncHandler(async (req, res) => {
  const user = req.user;
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const emailExists = await User.findOne({ email });
  if (emailExists) return res.status(400).json({ message: 'Email already exists.' });

  user.email = email;
  user.isValidEmail = false; // Require re-verification
  await user.save();

  // Send verification email again
  const emailToken = crypto.randomBytes(20).toString('hex');
  user.emailValidationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
  user.emailValidationTokenExpire = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONT_END_URL}/email/verify/${emailToken}`;
  const message = `
    Hi ${user.firstname || ''} ${user.lastname || ''},
    Please verify your new email by clicking the link below:
    <a href="${verificationUrl}">Verify Email</a>
  `;

  try {
    await sendmail({
      email: user.email,
      subject: 'Verify your new email - Smart Learn EFIC 360',
      message,
    });
    res.status(200).json({ message: `Verification email sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: 'Could not send verification email.' });
  }
});

// Login
// const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) return res.status(400).json({ message: 'Please enter email and password.' });

//   const user = await User.findOne({ email }).select('+password');
//   if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

//   if (!user.isValidEmail) return res.status(403).json({ message: 'Please verify your email first.' });

//   sendToken(user, 200, res);
// });

const login=asyncHandler(async(req,res)=>{

       try{
         const {email,password}=req.body
        if(!email||!password)return res.status(400).json({success:"fail",message:"Please Enter Email and password"})

        //get data from the database based on the email and password
        
            const user= await User.findOne({email}).select('+password') 

            if(!user || !await user.isValidPassword(password)) return res.status(401).json({success:"fail",message:"Invalid  Email and password"})
            sendToken(user,200,res)
        }
        catch(err)
        {
            res.status(400).json({
                error:err.name,
                message:err.message
            })
        } 
})

// Logout
// const logout = asyncHandler(async (req, res) => {
//   res.cookie('token', '', {
//     expires: new Date(0),
//     httpOnly: true,
//   });
//   res.status(200).json({ message: 'Logged out successfully.' });
// });
const logout=(req,res,next)=>{
   try {
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    }).status(200).json({success:"true",message:"logged out"})
   } catch (error) {
     res.status(400).json({success:"fail",message:error.message})
   }
} 
// Forgot Password
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;

//   if (!email) return res.status(400).json({ message: 'Please provide your email.' });

//   const user = await User.findOne({ email });
//   if (!user) return res.status(404).json({ message: 'No user found with this email.' });

//   const resetToken = crypto.randomBytes(20).toString('hex');
//   user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//   user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

//   await user.save({ validateBeforeSave: false });

//   const resetUrl = `${process.env.FRONT_END_URL}/password/reset/${resetToken}`;
//   const message = `
//     You requested a password reset.
//     Click here to reset your password: ${resetUrl}
//     If you did not request this, please ignore this email.
//   `;

//   try {
//     await sendmail({
//       email: user.email,
//       subject: 'Password Reset - Smart Learn EFIC 360',
//       message,
//     });
//     res.status(200).json({ message: 'Password reset email sent.' });
//   } catch (error) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save({ validateBeforeSave: false });
//     res.status(500).json({ message: 'Email could not be sent.' });
//   }
// });

// // Reset Password
// const resetPassword = asyncHandler(async (req, res) => {
//   const resetToken = req.params.resetToken;
//   const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) return res.status(400).json({ message: 'Invalid or expired reset token.' });

//   user.password = await bcrypt.hash(req.body.password, 12);
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();

//   sendToken(user, 200, res, 'Password reset successful.');
// });

// // Get Profile
// const getProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id).select('-password');
//   res.status(200).json({ user });
// });

// // Change Password
// const changePassword = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id).select('+password');
//   const { currentPassword, newPassword, confirmNewPassword } = req.body;

//   if (!currentPassword || !newPassword || !confirmNewPassword) {
//     return res.status(400).json({ message: 'Please provide all required fields.' });
//   }

//   const isMatch = await bcrypt.compare(currentPassword, user.password);
//   if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

//   if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'New passwords do not match.' });

//   user.password = await bcrypt.hash(newPassword, 12);
//   await user.save();

//   res.status(200).json({ message: 'Password changed successfully.' });
// });

// Update Profile
const updateMyprofile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
  res.status(200).json({ user });
});

// Delete Profile
const deleteMyprofile = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.status(200).json({ message: 'User profile deleted successfully.' });
});
//forgotPassword:- SideSupplyCraft/password/forgot
const forgotPassword=asyncHandler(async(req,res,next)=>{

    if(req.body.email==='')
    {
      return res.status(400).json({message:"Please enter your email "})
    }
    const user =  await User.findOne({email: req.body.email});
    if(!user)
    {
        return res.status(400).json({message:"There is no user in this email"})

    }
    try {

    //get token
    const token=await user.getResetPasswordToken();
    //save user to save resetPasswordToken field and resetPasswordExpire field
    await user.save({validateBeforeSave:false})

    //create URL
    /* const resetURL=`${req.protocol}://${req.get('host')}/SiteSupplyCraft/password/reset/${token}` */
    const resetURL=`${process.env.FROND_END_URL}/password/reset/${token}`
    const message = `Your password reset url is as follows \n\n 
                    <a href="${resetURL}"><button style="padding: 10px; background-color: #3498db; color: #ffffff; border-radius: 5px; cursor: pointer;">Reset Password</button></a>
                    \n\n If you have not requested this email, then ignore it.`;

    await sendmail(
        {
            email:user.email,
            subject:"RECOVERY PASSWORD",
            message
        }
    )
    res.status(200).json({
        success: true,
        message: `Email sent to your ${user.email}`
    })

   } catch (error) {
    user.resetPasswordToken=undefined
    user.resetPasswordTokenExpire=undefined
    await user.save({validateBeforeSave:false})
     res.status(500).json({success:"fail",message:error.message})
   } 
} )
//reset Password /password/reset/:token
const resetPassword=asyncHandler(async(req,res)=>{
  try {
    const hasedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({
      resetPasswordToken:hasedToken,
      resetPasswordTokenExpire:
        {
          $gt:new Date()
        }
      })
      if(!user)
      {
        return res.status(400).json({message:"'Password reset token is invalid or expired'"})
      }
  
      if(req.body.password!== req.body.confirmPassword)return res.status(400).json({message:"'Password does not match'"})
  
      user.password = req.body.password;
      user.resetPasswordToken=undefined
      user.resetPasswordTokenExpire=undefined
      await user.save({validateBeforeSave:false})
      sendToken(user, 201, res)
  } catch (err) {
    res.status(400)
    .json({
        success:false,
        message:err.message
    })
  }
})

//password change - /myprofile/changepassword
const changePassword=asyncHandler(async(req,res,next)=>{
  try{
    const user=await User.findById(req.user.id).select('+password')
    if(! await user.isValidPassword(req.body.oldPassword)) 
    {
       return res.status(401).json({
        success:false,
        message:'old password is incorrect',
      })
    } 
     //cofirm password
     if(req.body.password!==req.body.confirmPassword) return res.status(409).json({message:"Password is not matched"})

     //assign new password
     user.password=req.body.password
     await user.save()
    res.status(200).json({
      success:true,
      user,
    })
  }
  catch(err)
  {
    res.status(400).json({
      success:false,
      message:err.message,
    })
  }

})
//  Add this above `module.exports`
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ user });
});








module.exports = {
  register,
  verifyEmail,
  resendVerificationEmail,
  changeUserEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword,
  updateMyprofile,
  deleteMyprofile,
};

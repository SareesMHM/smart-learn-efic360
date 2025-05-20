const User = require("../models/User")


const sendToken=async(user,statusCode,res,additional=null)=>{

    try{
        //create token
        const token=await user.getJwtToken()
  
    //create cookie options
    const option={
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME*24*60*60*1000),
        httpOnly:true
    }    
      const USER=await User.findById({_id:user.id}).lean()
    

    res.status(statusCode)
    .cookie('token',token,option)
    .json({
        success:true,
        USER,
        token,
        message:additional
    })
    }  
    catch(err)
    {
        console.log(err)
        res.status(400)
        .json({
            success:false,
            message:err.message
        })
    }
}
module.exports=sendToken
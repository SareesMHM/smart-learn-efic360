import React, { useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SendVerification = () => {
 const location =useLocation();
 const {user}=location.state

  useEffect(()=>{
    if(user?.isvalidEmail)
    {      
      /* if(user && user.role ==='Admin')
      {
        dispatch(getTotals_per_month)
        dispatch(getTotals)
        return navigate('/admin')
      } 
      else if(user && user.role ==='Product Owner')
      {
        return navigate('/ProductOwner/DashBoard')
      } 
      else */ return navigate('/')
    }
    if(message) {
      toast.success(message, {
        position: toast.POSITION.BOTTOM_CENTER,
        onOpen:dispatch(clearMessage())
      });
    }
    if(error){
      toast.error(error, {
        position: toast.POSITION.BOTTOM_CENTER,
        onOpen:()=>dispatch(clearAuthError)
      });
    }
  },[message,error,dispatch])

 

  const handleResendLink = () =>{
    dispatch(resendEmail)
  };
  const handleChangeEmail=()=>{
    dispatch(changeEmail(email))
    setShow(false)
  }

  return (
    <center>
    <div className='container'>
      <div className='frame'>
      <img src={icon} className='round-image' style={{position:'relative',right:'80px'}}/>
      <center>        
        <h1>Please Verify Your Email</h1>
        <p>You have submitted your application successfully!</p>
        <p>We have sent a verification link to {email}</p>
        <p>Please click on the link to complete the verification process.</p>
        <p>Please make sure you check your spam folder</p>
        <Button onClick={handleResendLink}>Resend Verification Email</Button>
        <Button onClick={handleShow}>Change Email Address</Button>
        </center>
      </div>
    </div>
    </center>
  )
}

export default SendVerification
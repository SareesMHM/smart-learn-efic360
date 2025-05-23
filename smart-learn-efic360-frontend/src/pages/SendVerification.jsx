import React, { useEffect } from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import icon from '../images/efic-icon-512.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changeEmail, resendEmail } from '../services/authService';


const SendVerification = () => {
  const [show, setShow] = useState(false);
  const navigate=useNavigate()
  const location =useLocation();
 const {user}=location.state
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(()=>{
    if(user?.isvalidEmail)
    {      
       return navigate('/')
    }
    if(message) {
      toast.success(message, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
    if(error){
      toast.error(error, {
        position: toast.POSITION.BOTTOM_CENTER,
      });
    }
  },[message,error])

 

 const handleResendLink = async () => {
  try {
    const data = await resendEmail();
    setMessage(data.message);
  } catch (error) {
    setMessage('Failed to resend email.');
  }
};

const handleChangeEmail = async () => {
  try {
    const data = await changeEmail(email);
    setMessage(data.message);
    setShow(false);
  } catch (error) {
    setMessage('Failed to change email.');
  }
};

  return (
    <>
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
    
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change your email address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value = {email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder='Enter your new Email'
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleChangeEmail}>
            Upadate Email & Resend Link
          </Button>
        </Modal.Footer>
        
      </Modal>    
    </>
  )
}

export default SendVerification
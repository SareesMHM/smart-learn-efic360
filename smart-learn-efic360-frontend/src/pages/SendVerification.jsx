import React, { useEffect } from 'react';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import icon from '../images/efic-icon-512.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changeEmail, resendEmail } from '../services/authService';
import Loader from '../components/Loader';
import { useMutation } from '@tanstack/react-query';


const SendVerification = () => {
  const [show, setShow] = useState(false);
  const navigate=useNavigate()
  const location =useLocation();
  const {user}=location.state;
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [email, setEmail] = useState('');

const resendEmailMutation = useMutation({
  mutationFn: resendEmail,
  onSuccess: (data) => toast.success(data.message),
  onError: () => toast.error('Failed to resend email.')
});

const changeEmailMutation = useMutation({
  mutationFn: () => changeEmail(email),
  onSuccess: (data) => {
    toast.success(data.message);
    setShow(false);
  },
  onError: () => toast.error('Failed to change email.')
});

  useEffect(()=>{
    if(user?.isvalidEmail)
    {      
       return navigate('/')
    }
  },[user])

 

 const handleResendLink = async () => {
  
    resendEmailMutation.mutate()
  
};

const handleChangeEmail = async () => {
    changeEmailMutation.mutate(email)
    setShow(false);
  
};

  return (
  resendEmailMutation.isPending || changeEmailMutation.isPending?
  <Loader/>:    
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
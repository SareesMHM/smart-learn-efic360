import React, { useEffect, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';


import { toast } from 'react-toastify';

import { Col, Row } from 'react-bootstrap'

const Verification = () => {
  const location=useLocation()
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const {isLoading,user,error,message}=useSelector((state)=>state.adminState)
  /* const{id}=useParams(); */
  const {id}=location.state
  console.log(location.state)
  const dispatch=useDispatch()
  const navigate=useNavigate()

  useEffect(()=>{
    if(error){
      return toast.error(error,{
        position:'bottom-center',
        onOpen:()=>clearError()
      })
    }
    else if(message){
      navigate('/admin/verifications')
      toast.success(message,{
        position:'bottom-center',
        onOpen:()=>clearError()
      })
    }
    return
  },[dispatch,error,message,navigate])

  // Function to toggle fullscreen image
  const toggleFullscreenImage = (image) => {
    setFullscreenImage(image);
  };

  const handleApprove=()=>{
    dispatch(verifyOwner(id))
  }

  const handleCancel=()=>{
    dispatch(cancelOwner(id))
  }

  return (
    <>
    {isLoading?<Loader/>
      :
      <center>
      <hr />
      <h2><u>Account Details</u></h2>
      <div className="Details">
        <hr />
        <div className="row d-flex justify-content-between">
          <div className="col-3 ml-3" onClick={() => toggleFullscreenImage(user?.profile)}>
            <img src={user?.profile} alt="Company profile" width="250" height="250" />
          </div>
          <div className='col-8 d-flex'>
          <div style={{ display: 'table', margin: '20px auto' }}>
            <form style={{ display: 'table-row' }}>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="gradeId" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>Grade:</label>
                <input type="text" id="gradeId" readOnly={true} name="gradeId" defaultValue={user?._id} style={{ display: 'table-cell', padding: '5px',border:'none',width: '300px',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="full_name" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>Full Name:</label>
                <input type="text" id="full_name" readOnly={true} name="full_name" defaultValue={user?.firstname + " " + user?.lastname} style={{ display: 'table-cell', width: '300px', padding: '5px',border:'none',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="parentnic" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>parent NIC:</label>
                <input type="text" id="parentnic" readOnly={true} name="parentnic" defaultValue={user?.shopReg_no} style={{ display: 'table-cell', padding: '5px', width: '300px',border:'none',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="email" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>E-mail:</label>
                <input type="email" id="email" readOnly={true} name="email" defaultValue={user?.email} style={{ display: 'table-cell', padding: '5px',border:'none', width: '300px',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="parentPhone" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>Parent Phone No.:</label>
                <input type="tel" id="parentPhone" readOnly={true} name="parentPhone" defaultValue={user?.phone} style={{ display: 'table-cell', padding: '5px',border:'none', width: '300px',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="address" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>Address:</label>
                <input type="text" id="address" readOnly={true} name="address" defaultValue={user?.address.number + " " + user?.address.street} style={{ display: 'table-cell',width: '300px', padding: '5px',border:'none',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="city" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>City:</label>
                <input type="text" id="city" readOnly={true} name="city" defaultValue={user?.address.city} style={{ display: 'table-cell', padding: '5px',width: '300px',border:'none',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="district" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>District:</label>
                <input type="text" id="district" readOnly={true} name="district" defaultValue={user?.address.district} style={{ display: 'table-cell',width: '300px', padding: '5px',border:'none',borderBottom:'2px solid green' }} required />
              </div>
              <div style={{ display: 'table-row' }}>
                <label htmlFor="landmark" style={{ display: 'table-cell', padding: '5px', verticalAlign: 'top' }}>Postal Code:</label>
                <input type="text" id="landmark" readOnly={true} name="landmark" defaultValue={user?.address.postalCode} style={{ display: 'table-cell',width: '300px', padding: '5px',border:'none',borderBottom:'2px solid green' }} />
              </div>
            </form>
          </div>

          </div>
        </div>
        <div className="row">
          <div className="col" onClick={() => toggleFullscreenImage(user?.certificate)}>
            <img src={user?.certificate} alt="Business registration certificate" width="200" height="300" />
          </div>
          <div className="col" onClick={() => toggleFullscreenImage(user?.currentBill)}>
            <img src={user?.currentBill} alt="Current bill" width="250" height="150" />
          </div>
        </div>
      </div>
      {/* Display fullscreen image */}
      {fullscreenImage && (
        <div className="fullscreen-image-overlay" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Fullscreen" className="fullscreen-image" />
        </div>
      )}
      <Row>
        <Col>
          <button className="verificationBtn" type="submit" name="approve" onClick={handleApprove}>Approve</button>
        </Col>
        <Col>
          <button className="verificationBtn" type="submit" name="cancel" onClick={handleCancel}>Cancel</button>
        </Col>
      </Row>
    </center>
    }
    </>
  );
};

export default Verification;

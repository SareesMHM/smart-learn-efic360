// src/services/authService.js
import axios from './api'; // Axios instance configured with baseURL



/**
  Login user with email and password
  @param {string} email
  @param {string} password
 @returns {Promise<Object>} User data and token
 */
export const login = async (email, password) => {
  const response = await axios.post('/login', { email, password });
  return response.data; // expected { token, user }
};

/**
 Register a new user
  @param {Object} userData - { name, email, password, role }
  @returns {Promise<Object>} User data and token
 */
export const register = async (data) => {
  
  const response = await axios.post('/register', data,{
      headers: {
      'Content-Type': 'multipart/form-data' 
    }
  });


  return response.data;
};

export const fetchCurrentUser = async () => {
 const response = await axios.get('/getProfile');
  return response.data;
};

export const verifyEmail=async(token)=>{
    try {
        const {data}=await axios.put(`/email/verify/${token}`)
        return data
    } catch (error) {
        console.log(error)
    }

}
export const resendEmail=async()=>{
    try {
        const {data}=await axios.put(`/email/resend`)   
        return data   
    } catch (error) {
        console.log(error)
    }

}

export const changeEmail=async(newEmail)=>{
    try {
        const {data}=await axios.put(`/email/change`,{'email':newEmail},)
        return data
    } catch (error) {
        console.log(error)
    }

}

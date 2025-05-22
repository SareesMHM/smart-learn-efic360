const express = require('express');
const router = express.Router();

const upload = require('../utils/upload');
const { register, login } = require('../controllers/authController');





// POST /api/auth/login


// POST /api/auth/registration (with profileImage file upload)
router.post('/register', upload.fields([{ name: 'profileImage', maxCount: 1 }]), register);
router.post('/login', login);

module.exports = router;













// router.post('/register', register).post(upload.fields([{ name: 'profileImage', maxCount: 1 }]), register);



// router.route('/email/verify/:token').put(isAuthenticatedUser,verifyEmail)
// router.route('/email/resend').put(isAuthenticatedUser,resendVerificationEmail)
// router.route('/email/change').put(isAuthenticatedUser,changeUserEmail)
// router.route('/login').post(login)
// router.route('/logout').get(logout)
// router.route('/password/forgot').post(forgotPassword)
// router.route('/password/reset/:token').put(resetPassword)
// router.route('/myprofile').get(isAuthenticatedUser,getProfile)
// router.route('/myprofile/changepassword').put(isAuthenticatedUser,changePassword)
// router.route('/myprofile/edit').put(isAuthenticatedUser,upload.fields([{name:'profile'},{name:'certificate'},{name:'currentBill'}]),updateMyprofile)
// router.route('/myprofile/delete').delete(isAuthenticatedUser,deleteMyprofile)
// module.exports = router;
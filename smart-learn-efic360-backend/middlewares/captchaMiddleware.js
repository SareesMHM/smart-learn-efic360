// middlewares/captchaMiddleware.js
const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
  try {
    const token = req.body.captchaToken || req.headers['x-captcha-token'];
    if (!token) {
      return res.status(400).json({ message: 'Captcha token is missing' });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await axios.post(verificationUrl);

    if (!response.data.success) {
      return res.status(400).json({ message: 'Failed captcha verification' });
    }

    next();
  } catch (error) {
    console.error('Captcha verification error:', error);
    res.status(500).json({ message: 'Captcha verification failed' });
  }
};

module.exports = verifyCaptcha;

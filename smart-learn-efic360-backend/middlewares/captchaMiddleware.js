// middlewares/captchaMiddleware.js
const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
  const token = req.body.captchaToken || req.headers['x-captcha-token'];
  if (!token) {
    return res.status(400).json({ message: 'Captcha token missing' });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    if (!response.data.success) {
      return res.status(400).json({ message: 'Captcha verification failed' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Captcha verification error' });
  }
};

module.exports = verifyCaptcha;

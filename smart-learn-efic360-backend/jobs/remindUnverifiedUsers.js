const cron = require('node-cron');
const User = require('../models/User');
const sendmail = require('../utils/emailHelper');

const sendRemindersToUnverifiedUsers = async () => {
  const users = await User.find({ isValidEmail: false });

  for (const user of users) {
    const message = `
      Hi ${user.fullName},
      This is a friendly reminder to verify your email for Smart Learn EFIC 360.
    `;
    await sendmail({
      email: user.email,
      subject: 'Reminder: Please Verify Your Email',
      message,
    });
  }

  console.log(` Sent ${users.length} email verification reminders`);
};

// Run daily at 8 AM
cron.schedule('0 8 * * *', () => {
  console.log(' Running daily reminder job...');
  sendRemindersToUnverifiedUsers();
});

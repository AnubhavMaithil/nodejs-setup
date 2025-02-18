const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services like Outlook, Yahoo, etc.
    auth: {
        user: process.env.EMAIL_USER, // Replace with your email
        pass: process.env.EMAIL_PASS, // Use app password if 2FA is enabled
    },
});


async function sendEmail(recipient, otp) {
    if (!recipient || typeof recipient !== 'string') {
        throw new Error('Recipient email is required and must be a valid string.');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient,
        subject: 'password reset otp',
        html: `
        <h1 style="font-size: 18px;">Your password reset otp is ${otp}</h1>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}: ${info.response}`);
    } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        throw error; // Propagate error to the caller
    }
}

module.exports = {
    sendEmail
};
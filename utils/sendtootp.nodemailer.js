const nodemailer = require('nodemailer');

 // Start of Selection
/**
 * Sends an OTP to the user's email address.
 * 
 * @param {Object} sendToOtp - The parameters for sending the OTP.
 * @param {string} sendToOtp.subject - The subject of the email.
 * @param {string} sendToOtp.html - The HTML content of the email.
 * @param {Object} sendToOtp.user - The user object containing user details.
 * @param {string} sendToOtp.otp - The One Time Password to be sent.
 * @returns {Promise} A promise that resolves to the result of the email sending operation.
 */

// Function to send OTP
async function sendToOtp({ subject, html, user, otp }) {
    const { GMAIL_USER_EMAIL, GMAIL_PASSWORD } = process.env; // Use email and password from .env
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host:'smtp.gmail.com',
            secure:true,
            debug:true,
            auth: {
                user: GMAIL_USER_EMAIL, // Your Gmail address
                pass: GMAIL_PASSWORD, // Your Gmail password
            },
        });

        const result = await transporter.sendMail({
            from:`Bionova <${GMAIL_USER_EMAIL}>`,
            to: user.email.primary, // Use the email from the user object
            subject: subject || 'Bionova Account Verification OTP ✔',
            html: html || `<div style="width: 100%;font-family: 'Franklin Gothic Medium','Arial Narrow', Arial, sans-serif;font-size: 14px; text-align: center;">
                            <p style="font-weight: 800; font-size: 16px;">Dear <span>${user?.name?.username}</span>,</p>
                            <p style="color: rgb(0, 217, 255);font-weight: 700; line-height: .5;">Your One Time Password(OTP) is :</p>
                            <h2 style="font-family: cursive; font-weight: 900; background: #f0f0f0; padding: 10px 30px; width: fit-content; margin: auto; border-radius: 5px; letter-spacing: 2px;">${otp}</h2>
                            <p style="line-height: .5;">Your OTP will expire in 10 min.</p>
                            <p style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Do not share your OTP with anyone including your Depository Participant (DP).</p>
                            <p>For any OTP related query please email us at <a href="mailto:bionova@gmail.com">bionova@gmail.com</a></p>
                            <p style="font-weight: 700;font-size: 16px;line-height: 1;">Warm Regards,</p>
                            <p style="text-decoration: underline; color: cornflowerblue;">The GK Traders.</p>
                        </div>`,
        });
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = { sendToOtp };

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if credentials exist
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error('SMTP_EMAIL and SMTP_PASSWORD are not configured in your .env file! Please add them to send real emails.');
    }

    if (process.env.SMTP_EMAIL === 'your_project_email_address@gmail.com') {
        throw new Error('You copied the placeholder! Please replace both SMTP_EMAIL and SMTP_PASSWORD with a REAL Gmail address and App Password.');
    }

    // To get the "Instagram-like" flow where users receive real emails,
    // the server MUST log into a real email account (like a project Gmail account).
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const message = {
        // The "From" address (this is the admin/project email)
        from: `${process.env.FROM_NAME || 'Discussion Forum App'} <${process.env.SMTP_EMAIL}>`,
        // The "To" address (the email of the user who forgot their password)
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log(`[REAL EMAIL SENT] Message sent to ${options.email} with id: ${info.messageId}`);
    return true;
};

module.exports = sendEmail;

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// 1. Create a Transporter (The connection to your email service)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        // This prevents failure on unauthorized certificates (helpful for local testing)
        rejectUnauthorized: false
    }
});

// 2. Define the Send Mail Route
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name) {
        return res.status(400).json({ success: false, message: 'Please provide name.' });
    } else if(!email) {
        return res.status(400).json({ success: false, message: 'Please provide mail.' });
    } else if(!message) {
        return res.status(400).json({ success: false, message: 'Please provide message.' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        // to: process.env.EMAIL_USER,
        to: process.env.EMAIL_ACTUAL_USER,
        replyTo: email,
        subject: `New Contact Form: ${subject || 'No Subject'}`,
        html: `
        <div style="font-family: Calibri, sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #444;">New Contact Request</h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 30%;">Field</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Details</th>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Name</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">${name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Email</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>Subject</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd;">${subject || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; vertical-align: top;"><strong>Message</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #ddd; line-height: 1.5;">${message}</td>
                </tr>
            </table>
            <p style="font-size: 12px; color: #777; margin-top: 20px;">
                This email was generated from your website's contact form.
            </p>
        </div>`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    });
});

app.get('/', (req, res) => {
    res.json({
        success: "get Api", message: 'Message sent successfully!'

    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
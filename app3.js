const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* =========================
   CORS – ALLOW ALL
========================= */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json());

/* =========================
   MAIL TRANSPORTER
========================= */
// 👉 Gmail

const transporter = nodemailer.createTransport({
    shost: 'smtp.gmail.com',
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

// 👉 Outlook / Hotmail
// const transporter = nodemailer.createTransport({
//     host: 'smtp.office365.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

/* =========================
   SEND MAIL API
========================= */
app.post('/api/send-mail', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and message are required'
        });
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

    // try {
    //     await transporter.sendMail(mailOptions);
    //     res.status(200).json({
    //         success: true,
    //         message: 'Email sent successfully'
    //     });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({
    //         success: false,
    //         message: 'Email sending failed'
    //     });
    // }

    try {
        const info = await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
            info
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }

});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
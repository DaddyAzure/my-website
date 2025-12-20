// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer'); // Import the email tool
const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// --- ROUTES (GET) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leadership.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'leadership.html'));
});

// --- ROUTES (POST) ---
app.post('/submit-contact', async (req, res) => {
    const { name, email, message } = req.body;

    console.log('--- SENDING EMAIL ---');

    // 1. Configure the "Transporter" (The mailman)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Explicitly connecting to Google
        port: 2525,              // This is the secure SSL port
        secure: true,           // Use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 2. Configure the Email Details
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: process.env.EMAIL_USER,   // Receiver address (Sends to yourself)
        replyTo: email,               // When you hit reply, it goes to the user
        subject: `New Message from Website: ${name}`,
        text: `You have a new message from ${name} (${email}):\n\n${message}`
    };

    // 3. Send the Email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        
        // Success Page
        res.send(`
            <div style="text-align: center; padding: 50px; font-family: sans-serif;">
                <h1 style="color: green;">Message Sent!</h1>
                <p>Thanks ${name}, we have received your email.</p>
                <a href="/leadership.html">Go Back</a>
            </div>
        `);
    } catch (error) {
        console.error('Error sending email:', error);
        res.send(`
            <h1>Error</h1>
            <p>Something went wrong sending the email. Please try again.</p>
            <p>Error details: ${error.message}</p>
        `);
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
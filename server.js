
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer'); 
const app = express();
const PORT = process.env.PORT || 4000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leadership.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'leadership.html'));
});


app.post('/submit-contact', async (req, res) => {
    const { name, email, message } = req.body;

    console.log('--- SENDING EMAIL ---');

    
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 456,              
        secure: true,           
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: process.env.EMAIL_USER,   
        replyTo: email,               
        subject: `New Message from Website: ${name}`,
        text: `You have a new message from ${name} (${email}):\n\n${message}`
    };

    
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        
        
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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
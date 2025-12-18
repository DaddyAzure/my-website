// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname));




app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/leadership.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'leadership.html'));
});


app.post('/submit-contact', (req, res) => {
    
    const userName = req.body.name;
    const userEmail = req.body.email;
    const userMessage = req.body.message;

    
    console.log('--- NEW MESSAGE RECEIVED ---');
    console.log(`Name: ${userName}`);
    console.log(`Email: ${userEmail}`);
    console.log(`Message: ${userMessage}`);
    console.log('----------------------------');

    
    res.send(`
        <h1>Thank you, ${userName}!</h1>
        <p>We have received your message.</p>
        <a href="/leadership.html">Go Back to Leadership Page</a>
    `);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
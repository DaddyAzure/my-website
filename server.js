require('dotenv').config(); // Load env vars
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer'); 
const mongoose = require('mongoose'); // NEW: For Database
const cors = require('cors');         // NEW: For Browser permissions

const app = express();
const PORT = process.env.PORT || 4000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(bodyParser.json()); // NEW: Required to read the JSON sent by products.html
app.use(bodyParser.urlencoded({ extended: true })); // Required for the Contact Form
app.use(express.static(__dirname));

// --- DATABASE CONNECTION (NEW) ---
// Ensure you have MONGO_URI in your Render Environment Variables
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// --- DATA MODEL (NEW) ---
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    desc: String,
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// --- ADMIN AUTH CHECK (NEW) ---
const checkAdmin = (req, res, next) => {
    const providedPassword = req.headers['x-admin-password'];
    // Make sure to add ADMIN_PASSWORD to your Render Environment Variables
    const actualPassword = process.env.ADMIN_PASSWORD || "admin123"; 

    if (providedPassword === actualPassword) {
        next();
    } else {
        res.status(403).send("Invalid Password");
    }
};

// --- HTML PAGE ROUTES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/leadership.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'leadership.html'));
});

// Added this so your new page loads at /products.html
app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});


// --- PRODUCT API ROUTES (NEW) ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Add Product (Protected)
app.post('/api/products', checkAdmin, async (req, res) => {
    const { name, price, desc } = req.body;
    const newProduct = new Product({ name, price, desc });

    try {
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Delete Product (Protected)
app.delete('/api/products/:id', checkAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- CONTACT FORM EMAIL ROUTE (EXISTING) ---
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

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
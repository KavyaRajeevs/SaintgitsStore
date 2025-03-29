const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// Constants
const JWT_SECRET = '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p';
const CLIENT_ID = '760072900583-d0o804i2a7ob0uquplh9imeu8r8rgr24.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// MongoDB Connections
const collegeStoreConnection = mongoose.createConnection('mongodb+srv://kavya:o0Bi6I5aNbxT1ghm@store.hyqsn.mongodb.net/?retryWrites=true&w=majority&appName=Store', {
    dbName: 'college_store',
    serverSelectionTimeoutMS: 5000
});

const testConnection = mongoose.createConnection('mongodb+srv://kavya:o0Bi6I5aNbxT1ghm@store.hyqsn.mongodb.net/?retryWrites=true&w=majority&appName=Store', {
    dbName: 'test',
    serverSelectionTimeoutMS: 5000
});

// Set up image storage
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Schema Definitions for college_store database
const ProductSchema = new mongoose.Schema({
    name: String,
    color: [String], // Unified as an array
    size: String,
    company: String,
    category: String,
    price: Number,
    instock: Number,
    imageUrl: String
}, { collection: 'college_store' });

const CartSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    price: Number,
    quantity: Number,
    imageUrl: String
}, { collection: 'cart' });

const WishlistSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    price: Number,
    imageUrl: String
}, { collection: 'wishlist' });

const StoreUserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
}, { collection: 'users' });

// Schema Definition for test database
const GoogleUserSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    picture: String,
    role: { type: String, default: 'user' }
}, { collection: 'users' });

// Models for college_store database
const Product = collegeStoreConnection.model('Product', ProductSchema);
const Cart = collegeStoreConnection.model('Cart', CartSchema);
const Wishlist = collegeStoreConnection.model('Wishlist', WishlistSchema);
const StoreUser = collegeStoreConnection.model('User', StoreUserSchema);

// Model for test database
const GoogleUser = testConnection.model('User', GoogleUserSchema);

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    next();
};

// Middleware to protect routes with JWT
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId || decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};



app.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);

        // Check if request contains token for Google login
        if (req.body.token) {
            console.log('Handling Google login');
            // Handle Google login
            const { token } = req.body;
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID
            });

            const { sub, name, email, picture } = ticket.getPayload();
            console.log('Google user payload:', { sub, name, email, picture });

            let user = await GoogleUser.findOne({ googleId: sub });
            if (!user) {
                user = new GoogleUser({ 
                    googleId: sub, 
                    name, 
                    email, 
                    picture 
                });
                if ((await GoogleUser.countDocuments()) === 0) user.role = 'admin'; 
                await user.save();
            }

            const jwtToken = jwt.sign(
                { 
                    id: user._id, 
                    role: user.role, 
                    name: user.name, 
                    picture: user.picture,
                    email: user.email 
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            console.log('Google login successful, JWT token generated:', jwtToken);
            
            return res.json({ 
                redirect: user.role === 'admin' ? 'dashboard.html' : 'home.html', 
                token: jwtToken 
            });
        } else {
            console.log('Handling traditional login');
            // Handle traditional login
            const { username, password } = req.body;
            const user = await StoreUser.findOne({ username });
            if (!user) {
                console.log('User not found:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log('Invalid password for user:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    username: user.username,
                    email: user.email 
                }, 
                JWT_SECRET
            );
            console.log('Traditional login successful, JWT token generated:', token);
            res.json({ token });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// 📌 GOOGLE USER ROUTES
app.get('/users', async (req, res) => {
    try {
        const users = await GoogleUser.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// 📌 PRODUCT ROUTES
app.get('/college_store', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.get('/college_store/search', async (req, res) => {
    const searchQuery = req.query.name;
    const products = await Product.find({
        name: { $regex: searchQuery, $options: 'i' }
    });
    res.json(products);
});

app.get('/college_store/:id', validateObjectId, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Invalid product ID' });
    }
});

app.get('/college_store/category/:category', async (req, res) => {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json(products);
});

app.post('/college_store', upload.single('image'), async (req, res) => {
    try {
        const { name, color, size, company, category, price, instock } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
        
        const product = new Product({ name, color, size, company, category, price, instock, imageUrl });
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Error saving product' });
    }
});

// app.put('/college_store/:id', validateObjectId, async (req, res) => {
//     try {
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         res.json(updatedProduct);
//     } catch (error) {
//         res.status(500).json({ error: 'Error updating product' });
//     }
// });

app.put('/college_store/:id', validateObjectId, upload.single('image'), async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            color: req.body.color,
            size: req.body.size,
            company: req.body.company,
            category: req.body.category,
            price: req.body.price,
            instock: req.body.instock,
        };

        // If an image file is uploaded, add the image URL
        if (req.file) {
            updatedData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
    }
});

app.delete('/college_store/:id', validateObjectId, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
});

// 📌 CART ROUTES
app.post('/cart', async (req, res) => {
    const { productId, name, price, imageUrl, quantity } = req.body;
    const existingItem = await Cart.findOne({ productId });
    if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
    } else {
        const cartItem = new Cart({ productId, name, price, imageUrl, quantity });
        await cartItem.save();
    }
    res.json({ message: 'Item added to cart' });
});

app.get('/cart', async (req, res) => {
    const cartItems = await Cart.find();
    res.json(cartItems);
});

app.get('/cart/:id', validateObjectId, async (req, res) => {
    try {
        const cartItem = await Cart.findById(req.params.id);
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching cart item' });
    }
});

app.put('/cart/:id', validateObjectId, async (req, res) => {
    await Cart.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Cart updated' });
});

app.delete('/cart/:id', validateObjectId, async (req, res) => {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed from cart' });
});

// 📌 WISHLIST ROUTES
app.post('/wishlist', async (req, res) => {
    const wishlistItem = new Wishlist(req.body);
    await wishlistItem.save();
    res.json({ message: 'Added to Wishlist' });
});

app.get('/wishlist', async (req, res) => {
    const wishlist = await Wishlist.find();
    res.json(wishlist);
});

app.get('/wishlist/:id', validateObjectId, async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findById(req.params.id);
        res.json(wishlistItem);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching wishlist item' });
    }
});

app.put('/wishlist/:id', validateObjectId, async (req, res) => {
    try {
        const updatedWishlistItem = await Wishlist.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedWishlistItem);
    } catch (error) {
        res.status(500).json({ error: 'Error updating wishlist item' });
    }
});

app.delete('/wishlist/:id', validateObjectId, async (req, res) => {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Removed from Wishlist' });
});
// Add this to your existing server.js file

// Schema for Stock Notifications
const NotificationSchema = new mongoose.Schema({
    productId: mongoose.Schema.Types.ObjectId,
    email: String,
    notified: { type: Boolean, default: false }
}, { collection: 'stock_notifications' });

const StockNotification = collegeStoreConnection.model('StockNotification', NotificationSchema);

// Stock Notification Route
app.post('/notify-stock', async (req, res) => {
    try {
        const { productId, email } = req.body;
        
        // Check if notification already exists
        const existingNotification = await StockNotification.findOne({ 
            productId, 
            email 
        });

        if (existingNotification) {
            return res.status(400).json({ message: 'Already subscribed for notifications' });
        }

        // Create new notification
        const notification = new StockNotification({ 
            productId, 
            email 
        });
        await notification.save();

        res.status(200).json({ message: 'Notification request recorded' });
    } catch (error) {
        console.error('Error in stock notification:', error);
        res.status(500).json({ message: 'Error processing notification request' });
    }
});

// Periodic job to check stock and send notifications (you'd typically use a separate service for this)
async function checkStockAndNotify() {
    const outOfStockProducts = await Product.find({ instock: { $lt: 10 } });
    
    for (let product of outOfStockProducts) {
        const notifications = await StockNotification.find({ 
            productId: product._id, 
            notified: false 
        });

        for (let notification of notifications) {
            // TODO: Implement email sending logic
            // sendEmail(notification.email, `${product.name} is back in stock!`);
            
            notification.notified = true;
            await notification.save();
        }
    }
}

// Run this periodically, e.g., every hour
// setInterval(checkStockAndNotify, 3600000);
// Start server
app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
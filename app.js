const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const Product = require('./models/product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmStand';

let connectionPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI && process.env.VERCEL) {
        throw new Error('MONGODB_URI environment variable is not set.');
    }

    if (!connectionPromise) {
        connectionPromise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
            })
            .then((conn) => {
                console.log('Connected to MongoDB');
                return conn;
            })
            .finally(() => {
                connectionPromise = null;
            });
    }

    await connectionPromise;
    return mongoose.connection;
}

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/', (req, res) => {
    res.redirect('/products');
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/products', asyncHandler(async (req, res) => {
    await connectDB();
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category });
        res.render('products/index.ejs', { products, category });
    } else {
        const products = await Product.find({});
        res.render('products/index.ejs', { products, category: 'All' });
    }
}));

app.get('/products/new', (req, res) => {
    res.render('products/new.ejs', { categories });
});

app.post('/products', asyncHandler(async (req, res) => {
    await connectDB();
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect('/products');
}));

app.get('/products/:id', asyncHandler(async (req, res) => {
    await connectDB();
    const { id } = req.params;
    const foundProduct = await Product.findById(id);
    if (!foundProduct) {
        return res.status(404).send('Product not found');
    }
    res.render('products/show', { foundProduct });
}));

app.get('/products/:id/edit', asyncHandler(async (req, res) => {
    await connectDB();
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).send('Product not found');
    }
    res.render('products/edit', { product, categories });
}));

app.put('/products/:id', asyncHandler(async (req, res) => {
    await connectDB();
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect('/products');
}));

app.delete('/products/:id', asyncHandler(async (req, res) => {
    await connectDB();
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
}));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error. Please check server logs and ensure MONGODB_URI is configured.');
});

const port = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
}

module.exports = app;

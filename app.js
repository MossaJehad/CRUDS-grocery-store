const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');

const Product = require('./models/product')

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('Could not connect to MongoDB' + err);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}))

app.get('/products', async (req, res) => {
    const products = await Product.find({})
    res.render('products/index.ejs', { products })
})

app.get('/products/new', (req, res) => {
    res.render('products/new.ejs')
})

app.post('/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect('/products')
})

app.get('/products/:id', async(req, res) => {
    const { id } = req.params;
    const foundProduct = await Product.findById(id)
    console.log(foundProduct)
    res.render('products/show', {foundProduct})
})

app.listen(3000, () => {
    console.log('Listening . . ');
})
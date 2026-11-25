const mongoose = require('mongoose');

const Product = require('./models/product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/farmStand';

const seedProducts = [
    {
        name: 'Fairy Eggplant',
        price: 1.00,
        category: 'vegetable'
    },
    {
        name: 'Organic Goddes Melon',
        price: 4.99,
        category: 'fruit'
    },
    {
        name: 'Organic Mini Seedless Watermelon',
        price: 3.99,
        category: 'fruit'
    },
    {
        name: 'Chocolate Whole Milk',
        price: 2.69,
        category: 'dairy'
    }
];

async function seedDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const res = await Product.insertMany(seedProducts);
        console.log('Seeded products:', res);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
}

seedDB();

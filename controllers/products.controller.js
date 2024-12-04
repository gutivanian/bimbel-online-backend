const ProductModel = require('../models/products.model');

// Mendapatkan semua produk
exports.getProducts = async (req, res) => {
    try {
        const products = await ProductModel.getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};


exports.getProductsFromTryOut = async (req, res) => {
    const exam_schedule_id =  req.params
    try {
        const products = await ProductModel.getProductsFromTryOut(exam_schedule_id);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

exports.getProductsPaket = async (req, res) => {
    const classtype =  req.params
    console.log(classtype)
    try {
        const products = await ProductModel.getProductsPaket(classtype);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
// Menambahkan produk baru
exports.createProduct = async (req, res) => {
    const { name, description, price, stock } = req.body;
    try {
        const newProduct = await ProductModel.createProduct({ name, description, price, stock });
        res.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProductsFromTryOut, getProductsPaket } = require('../controllers/products.controller');

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/tryout/:exam_schedule_id',getProductsFromTryOut );
router.get('/paket/:classtype',getProductsPaket );
module.exports = router;

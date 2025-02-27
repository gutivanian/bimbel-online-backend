// routes/filterRoutes.js
const express = require('express');
const router = express.Router();
const { getFilters,getGroupProducts, getSeries, getExamTypes } = require('../controllers/productType.controller');

// Endpoint untuk mengambil filter (group_product, series, exam_type)
router.get('/filters', getFilters);
// Endpoint untuk mencari group_product
router.get('/filters/group_product', getGroupProducts);

// Endpoint untuk mencari series berdasarkan group_product
router.get('/filters/series', getSeries);

// Endpoint untuk mencari exam_type berdasarkan group_product dan series
router.get('/filters/exam_type', getExamTypes);
module.exports = router;
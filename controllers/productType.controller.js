const productTypeModel = require('../models/productType.model');

const getFilters = async (req, res) => {
    try {
      const filters = {
        group_product: req.query.group_product || '',
        series: req.query.series || '',
        exam_type: req.query.exam_type || ''
      };
  
      const productTypes = await productTypeModel.getProductTypes(filters);
      res.status(200).json({ productTypes: productTypes.rows });
    } catch (error) {
      console.error('Error fetching filters:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

// Controller untuk mencari Group Product
const getGroupProducts = async (req, res) => {
    try {
      const search = req.query.search || ''; // Mengambil search query parameter
      const groupProducts = await productTypeModel.getGroupProducts(search);
      res.status(200).json({ groupProducts });
    } catch (error) {
      console.error('Error fetching group products:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // Controller untuk mencari Series berdasarkan Group Product
  const getSeries = async (req, res) => {
    try {
      const { group_product, search } = req.query;
      const series = await productTypeModel.getSeries(group_product, search);
      res.status(200).json({ series });
    } catch (error) {
      console.error('Error fetching series:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // Controller untuk mencari Exam Types berdasarkan Group Product dan Series
  const getExamTypes = async (req, res) => {
    try {
      const { group_product, series, search } = req.query;
      const examTypes = await productTypeModel.getExamTypes(group_product, series, search);
      res.status(200).json({ examTypes });
    } catch (error) {
      console.error('Error fetching exam types:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  module.exports = { getFilters,getGroupProducts, getSeries, getExamTypes };
  
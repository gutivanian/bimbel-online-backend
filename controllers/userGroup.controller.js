const groupModel = require('../models/userGroup.model');

const getAllGroups = async (req, res) => {
  try {
    const searchName = req.query.name || null;
    const groups = await groupModel.getGroups(searchName);
    
    res.status(200).json({
      status: 'success',
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllGroups
};
// controllers/roleController.js
const roleModel = require('../models/role.model');

/**
 * Controller untuk mencari role berdasarkan nama.
 * Endpoint: POST /api/roles/search
 */
const searchRoles = async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm || typeof searchTerm !== 'string') {
    return res.status(400).json({ message: 'searchTerm is required and must be a string.' });
  }

  try {
    const roles = await roleModel.searchRoles(searchTerm);
    console.log(roles)
    return res.status(200).json({ roles });
  } catch (error) {
    console.error('Error searching roles:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  searchRoles,
};

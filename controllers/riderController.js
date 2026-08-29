const riderModel = require('../models/riderModel');

const getRiders = async (req, res) => {
  try {
    const riders = await riderModel.getAllRiders();
    res.status(200).json({ success: true, data: riders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addRider = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'name and email required' });
    }
    const newRider = await riderModel.createRider(req.body);
    res.status(201).json({ success: true, data: newRider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const updated = await riderModel.updateAvailability(req.params.id, isAvailable);
    if (!updated) return res.status(404).json({ success: false, message: 'Rider not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeRider = async (req, res) => {
  try {
    const deleted = await riderModel.deleteRider(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Rider not found' });
    res.status(200).json({ success: true, message: 'Rider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRiders, addRider, toggleAvailability, removeRider };
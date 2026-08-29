const designerModel = require('../models/designerModel');

const getDesigners = async (req, res) => {
  try {
    const designers = await designerModel.getAllDesigners();
    res.status(200).json({ success: true, data: designers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addDesigner = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'name and email required' });
    }
    const newDesigner = await designerModel.createDesigner(req.body);
    res.status(201).json({ success: true, data: newDesigner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const updated = await designerModel.updateAvailability(req.params.id, isAvailable);
    if (!updated) return res.status(404).json({ success: false, message: 'Designer not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeDesigner = async (req, res) => {
  try {
    const deleted = await designerModel.deleteDesigner(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Designer not found' });
    res.status(200).json({ success: true, message: 'Designer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDesigners, addDesigner, toggleAvailability, removeDesigner };
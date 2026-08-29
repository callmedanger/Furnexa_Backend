const feedbackModel = require('../models/feedbackModel');

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedbackModel.getAllFeedbacks();
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedback = await feedbackModel.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFeedbacks, getFeedback };
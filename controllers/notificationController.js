const notificationModel = require('../models/notificationModel');

const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel.getAllNotifications();
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getNotification = async (req, res) => {
  try {
    const notification = await notificationModel.getNotificationById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, getNotification };
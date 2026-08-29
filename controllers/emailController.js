const transporter = require('../config/mailer');
const emailLogModel = require('../models/emailLogModel');

const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipients list is required' });
    }
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const results = await Promise.allSettled(
      recipients.map((email) =>
        transporter.sendMail({
          from: `"Furnexa" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          html: `<div style="font-family: sans-serif; font-size: 14px; color: #2E2118; line-height: 1.6;">
                   ${message.replace(/\n/g, '<br/>')}
                 </div>`,
        })
      )
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failCount = results.length - successCount;

    // Log save karna
    await emailLogModel.createLog({ recipients, subject, message, successCount, failCount });

    res.status(200).json({
      success: true,
      message: `Sent to ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ''}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmailLogs = async (req, res) => {
  try {
    const logs = await emailLogModel.getAllLogs();
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendBulkEmail, getEmailLogs };
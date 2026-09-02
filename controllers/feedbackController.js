const feedbackModel = require('../models/feedbackModel');
const transporter = require('../config/mailer');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const buildReplyEmailHTML = (customerName, originalMessage, replyMessage) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0; padding:0; background-color:#EDE6DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE6DA; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color:#ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(46,33,24,0.08);">
            <tr>
              <td style="background: linear-gradient(135deg, #2E2118, #3E2B1F); padding: 28px 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:36px; height:36px; background-color:#C98A3D; border-radius:8px; text-align:center; vertical-align:middle;">
                      <span style="color:#2E2118; font-size:16px; font-weight:bold; font-family: Georgia, serif;">F</span>
                    </td>
                    <td style="padding-left:12px;">
                      <span style="color:#ffffff; font-size:18px; font-weight:600;">Furnexa</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:3px; background: linear-gradient(90deg, #C98A3D, #E0A94A, #C98A3D);"></td></tr>
            <tr>
              <td style="padding: 30px 36px 8px 36px;">
                <h1 style="margin:0 0 18px 0; font-size:19px; color:#2E2118; font-weight:700; font-family: Georgia, serif;">
                  Regarding Your Feedback to Furnexa
                </h1>
                <p style="margin:0 0 16px 0; font-size:14px; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">
                  Hi ${customerName || 'there'},
                </p>
                <div style="font-size:14px; line-height:1.7; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif; white-space: pre-wrap;">${replyMessage}</div>
              </td>
            </tr>
            ${originalMessage ? `
            <tr>
              <td style="padding: 8px 36px 24px 36px;">
                <div style="background-color:#FAF7F2; border-left:3px solid #EDE6DA; padding:12px 16px; border-radius:6px;">
                  <p style="margin:0 0 4px 0; font-size:11px; color:#A99A82; text-transform:uppercase; letter-spacing:0.5px; font-family: Arial, Helvetica, sans-serif;">Your original feedback</p>
                  <p style="margin:0; font-size:13px; color:#8A7C68; font-family: Arial, Helvetica, sans-serif; font-style:italic;">"${originalMessage}"</p>
                </div>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding: 0 36px 32px 36px;">
                <p style="margin:0; font-size:13px; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">Warm regards,</p>
                <p style="margin:4px 0 0 0; font-size:13px; font-weight:700; color:#2E2118; font-family: Georgia, serif;">The Furnexa Team</p>
              </td>
            </tr>
            <tr><td style="padding: 0 36px;"><div style="border-top:1px solid #EDE6DA;"></div></td></tr>
            <tr>
              <td style="padding: 20px 36px 26px 36px; background-color:#FAF7F2;" align="center">
                <p style="margin:0; font-size:11px; color:#C9BBA5; font-family: Arial, Helvetica, sans-serif;">
                  © ${new Date().getFullYear()} Furnexa. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

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

const replyToFeedback = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }

    const feedback = await feedbackModel.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    if (!feedback.Email) {
      return res.status(400).json({ success: false, message: 'This feedback has no email on file' });
    }

    await transporter.sendMail({
      from: `"Furnexa" <${process.env.EMAIL_USER}>`,
      to: feedback.Email,
      subject: 'Regarding Your Feedback to Furnexa',
      html: buildReplyEmailHTML(feedback.Name, feedback.review, message),
    });

    const updated = await feedbackModel.addReply(req.params.id, message);
    res.status(200).json({ success: true, data: updated, message: 'Reply sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI: sentiment analyze + suggested reply (Gemini)
const analyzeFeedback = async (req, res) => {
  try {
    const feedback = await feedbackModel.getFeedbackById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

    const reviewText = feedback.review || '';
    const rating = feedback.rating || 5;

    const prompt = `You are analyzing customer feedback for Furnexa, a furniture e-commerce store.

Rating: ${rating}/5
Review: "${reviewText}"

Respond ONLY with valid JSON, no other text, no markdown code fences, in this exact format:
{"sentiment": "negative" or "neutral" or "positive", "suggestedReply": "a warm, professional reply to send the customer"}

If sentiment is negative, the suggested reply should acknowledge the issue, apologize sincerely, and offer to make it right. If positive, thank them warmly. Keep the reply under 80 words. Match the tone/language of the original review (English or Urdu/Roman Urdu).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const raw = response.text.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const updated = await feedbackModel.saveAnalysis(req.params.id, parsed.sentiment, parsed.suggestedReply);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ success: false, message: 'AI analysis failed. Please try again.' });
  }
};

module.exports = { getFeedbacks, getFeedback, replyToFeedback, analyzeFeedback };
// const transporter = require('../config/mailer');
// const emailLogModel = require('../models/emailLogModel');

// const sendBulkEmail = async (req, res) => {
//   try {
//     const { recipients, subject, message } = req.body;

//     if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
//       return res.status(400).json({ success: false, message: 'Recipients list is required' });
//     }
//     if (!subject || !message) {
//       return res.status(400).json({ success: false, message: 'Subject and message are required' });
//     }

//     const results = await Promise.allSettled(
//       recipients.map((email) =>
//         transporter.sendMail({
//           from: `"Furnexa" <${process.env.EMAIL_USER}>`,
//           to: email,
//           subject,
//           html: `<div style="font-family: sans-serif; font-size: 14px; color: #2E2118; line-height: 1.6;">
//                    ${message.replace(/\n/g, '<br/>')}
//                  </div>`,
//         })
//       )
//     );

//     const successCount = results.filter((r) => r.status === 'fulfilled').length;
//     const failCount = results.length - successCount;

//     // Log save karna
//     await emailLogModel.createLog({ recipients, subject, message, successCount, failCount });

//     res.status(200).json({
//       success: true,
//       message: `Sent to ${successCount} user(s)${failCount > 0 ? `, ${failCount} failed` : ''}.`,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getEmailLogs = async (req, res) => {
//   try {
//     const logs = await emailLogModel.getAllLogs();
//     res.status(200).json({ success: true, data: logs });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = { sendBulkEmail, getEmailLogs };
const transporter = require('../config/mailer');
const emailLogModel = require('../models/emailLogModel');

const buildEmailTemplate = (subject, message) => {
  const formattedMessage = message
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p style="margin: 0 0 16px 0;">${line}</p>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background-color:#EDE6DA; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE6DA; padding: 48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color:#ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(46,33,24,0.08);">

            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #2E2118, #3E2B1F); padding: 36px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:42px; height:42px; background-color:#C98A3D; border-radius:10px; text-align:center; vertical-align:middle;">
                            <span style="color:#2E2118; font-size:20px; font-weight:bold; font-family: Georgia, serif;">F</span>
                          </td>
                          <td style="padding-left:14px;">
                            <div style="color:#ffffff; font-size:22px; font-weight:600; letter-spacing:0.5px; line-height:1.2;">Furnexa</div>
                            <div style="color:#C9BBA5; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; margin-top:2px;">Furniture &amp; Interiors</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Accent line -->
            <tr>
              <td style="height:4px; background: linear-gradient(90deg, #C98A3D, #E0A94A, #C98A3D);"></td>
            </tr>

            <!-- Eyebrow -->
            <tr>
              <td style="padding: 32px 40px 0 40px;">
                <span style="display:inline-block; background-color:#FBEEDC; color:#A8672A; font-family: Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:5px 12px; border-radius:20px;">
                  Message from Furnexa
                </span>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 18px 40px 8px 40px;">
                <h1 style="margin:0 0 24px 0; font-size:24px; line-height:1.35; color:#2E2118; font-weight:700; font-family: Georgia, serif;">
                  ${subject}
                </h1>
                <div style="font-size:15px; line-height:1.75; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">
                  ${formattedMessage}
                </div>
              </td>
            </tr>

            <!-- Signature block -->
            <tr>
              <td style="padding: 8px 40px 36px 40px;">
                <p style="margin:0; font-size:14px; color:#4A3B2D; font-family: Arial, Helvetica, sans-serif;">
                  Warm regards,
                </p>
                <p style="margin:4px 0 0 0; font-size:14px; font-weight:700; color:#2E2118; font-family: Georgia, serif;">
                  The Furnexa Team
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px;">
                <div style="border-top:1px solid #EDE6DA;"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 40px 32px 40px; background-color:#FAF7F2;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px auto;">
                  <tr>
                    <td style="width:28px; height:28px; background-color:#C98A3D; border-radius:6px; text-align:center; vertical-align:middle;">
                      <span style="color:#2E2118; font-size:13px; font-weight:bold; font-family: Georgia, serif;">F</span>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 6px 0; font-size:12px; color:#A99A82; font-family: Arial, Helvetica, sans-serif; line-height:1.6;">
                  This email was sent by the Furnexa admin team.<br/>
                  If you weren't expecting this message, you can safely ignore it.
                </p>
                <p style="margin:14px 0 0 0; font-size:11px; color:#C9BBA5; font-family: Arial, Helvetica, sans-serif;">
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
};
const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipients list is required' });
    }
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required' });
    }

    const htmlContent = buildEmailTemplate(subject, message);

    const results = await Promise.allSettled(
      recipients.map((email) =>
        transporter.sendMail({
          from: `"Furnexa" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          html: htmlContent,
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
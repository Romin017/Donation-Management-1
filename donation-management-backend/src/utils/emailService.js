import nodemailer from 'nodemailer';

let transporter = null;

// Create transporter lazily (on first use)
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};

export const sendDonationConfirmationEmail = async ({
  donorName,
  donorEmail,
  campaignName,
  amount,
  date,
  paymentMode,
  notes,
}) => {
  const formattedAmount = Number(amount).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  });

  const formattedDate = new Date(date).toLocaleDateString('en-IN');

  const mailOptions = {
    from: `"Donation Management" <${process.env.EMAIL_USER}>`,
    to: donorEmail,
    subject: 'Donation Confirmation - Thank You',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Donation Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div style="background-color: #2563eb; color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0;">Donation Confirmation</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${donorName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">Thank you for your generous donation. Your donation has been successfully recorded.</p>
            <h3 style="margin-top: 25px;">Donation Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">   
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Donor Name</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${donorName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${donorEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Campaign</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${campaignName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Amount</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Date</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Payment Mode</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${paymentMode}</td>
              </tr>
              ${
                notes
                  ? `<tr>
                      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Notes</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${notes}</td>
                    </tr>`
                  : ''
              }
            </table>
            <p style="margin-top: 25px; font-size: 15px; line-height: 1.6;">We sincerely appreciate your support. Your contribution helps us continue our work.</p>
            <p style="margin-top: 25px;">Regards,<br /><strong>Donation Management Team</strong></p>
          </div>
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            This is an automated email. Please do not reply.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const transporter = getTransporter();
  return transporter.sendMail(mailOptions);
};

// ===============================
// SET PASSWORD EMAIL (new user setup)
// ===============================
export const sendSetPasswordEmail = async ({ name, email, role, setPasswordLink }) => {
  const mailOptions = {
    from: `"DonateHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Set up your DonateHub account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Set Up Your Account</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
          <div style="background-color: #2563eb; color: white; padding: 25px; text-align: center;">
            <h1 style="margin: 0;">Welcome to DonateHub</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              An account has been created for you on DonateHub as
              <strong>${role}</strong>. To get started, set your password using the button below.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setPasswordLink}"
                 style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                Set Your Password
              </a>
            </div>
            <p style="font-size: 13px; color: #555; line-height: 1.6;">
              Or copy and paste this link into your browser:<br />
              <a href="${setPasswordLink}">${setPasswordLink}</a>
            </p>
            <p style="font-size: 13px; color: #b45309; margin-top: 20px;">
              This link will expire in 24 hours.
            </p>
            <p style="margin-top: 25px;">Regards,<br /><strong>DonateHub Team</strong></p>
          </div>
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            This is an automated email. Please do not reply.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  const transporter = getTransporter();
  return transporter.sendMail(mailOptions);
};
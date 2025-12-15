import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: process.env.MAILTRAP_TOKEN
  }
});

export async function sendVerificationEmail(to, token) {
  const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"TrueLocalGems" <hello@demomailtrap.co>', // Verified sender for Mailtrap
    to: to,
    subject: 'Verify your email for TrueLocalGems',
    text: `Please verify your email by clicking the following link: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Welcome to TrueLocalGems!</h1>
        <p>Please verify your email address to complete your registration.</p>
        <p>
          <a href="${verificationLink}" style="background-color: #e3257b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>Or click this link: <a href="${verificationLink}">${verificationLink}</a></p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent to', to, 'MessageID:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
}

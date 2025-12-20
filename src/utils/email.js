const nodemailer = require('nodemailer');

async function sendOtpEmail({ to, otp }) {
  // Ưu tiên EMAIL_USER/EMAIL_PASSWORD, fallback sang SMTP_USER/SMTP_PASS nếu bạn đang dùng tên cũ
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    throw new Error('Thiếu cấu hình EMAIL_USER / EMAIL_PASSWORD (hoặc SMTP_USER / SMTP_PASS)');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  const mailOptions = {
    from: emailUser,
    to,
    subject: 'Mã OTP đặt lại mật khẩu - TravelNow',
    html: `
      <p>Xin chào,</p>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản TravelNow.</p>
      <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
      <p>Mã này có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>
      <p>Trân trọng,<br/>TravelNow</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail
};

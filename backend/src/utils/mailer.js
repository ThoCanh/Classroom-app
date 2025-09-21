const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email to new student
const sendWelcomeEmail = async (studentEmail, studentName, username, password) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: 'Chào mừng bạn đến với lớp học!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Chào mừng ${studentName}!</h2>
          <p>Bạn đã được thêm vào lớp học. Dưới đây là thông tin đăng nhập của bạn:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Thông tin đăng nhập:</h3>
            <p><strong>Tên đăng nhập:</strong> ${username}</p>
            <p><strong>Mật khẩu:</strong> ${password}</p>
          </div>
          
          <p>Vui lòng đăng nhập và đổi mật khẩu để bảo mật tài khoản.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Email này được gửi tự động từ hệ thống quản lý lớp học.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send lesson assignment email
const sendLessonAssignmentEmail = async (studentEmail, studentName, lessonTitle, lessonDescription) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: studentEmail,
      subject: `Bài học mới: ${lessonTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bài học mới được giao!</h2>
          <p>Xin chào ${studentName},</p>
          <p>Bạn có một bài học mới cần hoàn thành:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>${lessonTitle}</h3>
            <p>${lessonDescription}</p>
          </div>
          
          <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết và hoàn thành bài học.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Email này được gửi tự động từ hệ thống quản lý lớp học.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Lesson assignment email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending lesson assignment email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLessonAssignmentEmail
};

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransport();
  }

  createTransport() {
    // Gmail configuration
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS // Use App Password for Gmail
        }
      });
    }

    // SendGrid configuration (alternative)
    if (process.env.SENDGRID_API_KEY) {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    // Generic SMTP configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(userData) {
    const welcomeTemplate = this.getWelcomeTemplate(userData);

    const mailOptions = {
      from: `"LoveLingo Team" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: '💕 Welcome to LoveLingo - Your Language Love Story Begins!',
      html: welcomeTemplate,
      text: this.getWelcomeTextVersion(userData)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendNotificationEmail(userData) {
    const notificationTemplate = this.getNotificationTemplate(userData);

    const mailOptions = {
      from: `"LoveLingo Notifications" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to your team
      subject: `🎉 New LoveLingo Waitlist Signup: ${userData.name}`,
      html: notificationTemplate,
      text: `New signup: ${userData.name} (${userData.email}) wants to learn ${userData.language}`
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Notification email failed:', error);
      // Don't throw error for notification emails - they're not critical
    }
  }

  getWelcomeTemplate(userData) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to LoveLingo!</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b8a 0%, #ff8fab 50%, #ffb3c1 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; background: #ff6b8a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; margin: 15px 0; }
        .feature { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ff6b8a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💕 Welcome to LoveLingo, ${userData.name}!</h1>
          <p>Your language love story is about to begin!</p>
        </div>
        
        <div class="content">
          <p>Hi ${userData.name},</p>
          
          <p>🎉 <strong>You're officially on the LoveLingo waitlist!</strong> We're thrilled that you want to learn ${userData.language} with us.</p>
          
          <div class="feature">
            <h3>🎁 Your Early Access Perks:</h3>
            <ul>
              <li>Free premium storyline pack (worth $9.99)</li>
              <li>Founder's badge in your profile</li>
              <li>Exclusive character outfits</li>
              <li>Direct access to our development team</li>
            </ul>
          </div>
          
          <div class="feature">
            <h3>📅 What's Next:</h3>
            <ul>
              <li><strong>Month 3:</strong> Private beta launch (you get first access!)</li>
              <li><strong>Month 6:</strong> Full German + English release</li>
              <li><strong>Month 9:</strong> Spanish and Chinese expansion</li>
            </ul>
          </div>
          
          <p>We noticed you're interested in learning ${userData.language}${userData.level ? ` as a ${userData.level}` : ''}. Perfect! We're designing scenarios specifically for learners like you.</p>
          
          <p style="text-align: center;">
            <a href="https://instagram.com/lovelingo" class="btn">Follow Our Journey 📱</a>
          </p>
          
          <p>Keep an eye on your inbox - we'll be sharing exclusive updates, beta access, and maybe some language learning tips that don't suck! 😉</p>
          
          <p>Ready to fall in love with learning?</p>
          
          <p>With love,<br>
          <strong>The LoveLingo Team</strong><br>
          <em>Wasik, Xueying, Ansh & Leander</em></p>
        </div>
        
        <div class="footer">
          <p>💕 Made with love for language learners</p>
          <p><small>If you didn't sign up for this, you can safely ignore this email.</small></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getWelcomeTextVersion(userData) {
    return `
Welcome to LoveLingo, ${userData.name}!

You're officially on the LoveLingo waitlist! We're thrilled that you want to learn ${userData.language} with us.

Your Early Access Perks:
- Free premium storyline pack (worth $9.99)
- Founder's badge in your profile
- Exclusive character outfits
- Direct access to our development team

What's Next:
- Month 3: Private beta launch (you get first access!)
- Month 6: Full German + English release
- Month 9: Spanish and Chinese expansion

Keep an eye on your inbox - we'll be sharing exclusive updates, beta access, and language learning tips!

With love,
The LoveLingo Team
Wasik, Xueying, Ansh & Leander

Follow our journey: https://instagram.com/lovelingo
    `;
  }

  getNotificationTemplate(userData) {
    return `
    <h2>🎉 New LoveLingo Waitlist Signup!</h2>
    <p><strong>Name:</strong> ${userData.name}</p>
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>Language:</strong> ${userData.language}</p>
    <p><strong>Level:</strong> ${userData.level || 'Not specified'}</p>
    <p><strong>Frustration:</strong> ${userData.frustration || 'Not specified'}</p>
    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    
    <hr>
    <p><small>Sent from LoveLingo Landing Page</small></p>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
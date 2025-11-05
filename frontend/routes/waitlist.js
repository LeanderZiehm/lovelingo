
const express = require('express');
const Joi = require('joi');
const databaseService = require('../services/database');
const emailService = require('../services/email');

const router = express.Router();

// Validation schema
const waitlistSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  language: Joi.string().valid('german', 'spanish', 'chinese', 'hindi', 'english').required(),
  level: Joi.string().valid('beginner', 'basics', 'reading', 'intermediate').optional(),
  frustration: Joi.string().valid('anxiety', 'practice', 'boring', 'pronunciation').optional()
});

// POST /api/waitlist - Add new waitlist entry
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = waitlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const userData = value;
    
    // Check if email already exists
    const emailExists = await databaseService.checkIfEmailExists(userData.email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'This email is already on our waitlist! Check your inbox for our welcome email.'
      });
    }

    // Add IP and user agent for analytics
    userData.ip_address = req.ip || req.connection.remoteAddress;
    userData.user_agent = req.get('User-Agent');

    // Save to database
    const savedEntry = await databaseService.createWaitlistEntry(userData);

    // Send welcome email (don't wait for it)
    emailService.sendWelcomeEmail(userData).catch(error => {
      console.error('Welcome email failed:', error);
    });

    // Send notification email to team (don't wait for it)
    emailService.sendNotificationEmail(userData).catch(error => {
      console.error('Notification email failed:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Welcome to LoveLingo! Check your email for next steps.',
      data: {
        id: savedEntry.id,
        name: savedEntry.name,
        email: savedEntry.email,
        language: savedEntry.language
      }
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'This email is already on our waitlist!'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

// GET /api/waitlist/stats - Get waitlist statistics (optional)
router.get('/stats', async (req, res) => {
  try {
    const stats = await databaseService.getWaitlistStats();
    const languageStats = await databaseService.getLanguageStats();

    res.json({
      success: true,
      data: {
        ...stats,
        languages: languageStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch statistics'
    });
  }
});

module.exports = router;

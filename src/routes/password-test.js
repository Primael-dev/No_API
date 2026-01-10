// src/kevin-test/routes/password-test.js
import express from 'express';
const router = express.Router();

// Route 1 : Forgot Password
router.post('/forgot-password', (req, res) => {
  console.log('✅ /forgot-password called!');
  console.log('Body:', req.body);
  
  if (!req.body || !req.body.email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }
  
  res.json({ 
    success: true, 
    message: `Email sent to ${req.body.email} (test mode)`,
    note: 'Kevin OAuth & Password routes'
  });
});

// Route 2 : Reset Password
router.post('/reset-password', (req, res) => {
  res.json({ success: true, message: 'Reset password test' });
});

// Route 3 : Change Password  
router.post('/change-password', (req, res) => {
  res.json({ success: true, message: 'Change password test' });
});

export default router;
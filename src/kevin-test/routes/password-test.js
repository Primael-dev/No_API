// Kevin Password Routes - ES Modules
import express from 'express';
const router = express.Router();

// Route 1 : Forgot Password
router.post('/forgot-password', (req, res) => {
  console.log('✅ /forgot-password CALLED!');
  console.log('📧 Email received:', req.body.email);
  
  if (!req.body || !req.body.email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required',
      hint: 'Send JSON: {"email": "test@example.com"}'
    });
  }
  
  res.json({ 
    success: true, 
    message: `✅ Test successful! Email would be sent to: ${req.body.email}`,
    your_email: req.body.email,
    note: 'This is Kevin test route - WORKING'
  });
});

// Route 2 : Reset Password
router.post('/reset-password', (req, res) => {
  console.log('✅ /reset-password called');
  res.json({ 
    success: true, 
    message: 'Reset password test endpoint works',
    data: req.body 
  });
});

// Route 3 : Change Password  
router.post('/change-password', (req, res) => {
  console.log('✅ /change-password called');
  res.json({ 
    success: true, 
    message: 'Change password test endpoint works',
    data: req.body
  });
});

export default router;
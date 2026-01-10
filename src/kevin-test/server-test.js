// Kevin Test Server - ES Modules version
import express from 'express';
import cors from 'cors';
import passwordRoutes from './routes/password-test.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Tes routes
app.use('/api/auth/password', passwordRoutes);

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Kevin Test Server Running',
    endpoints: [
      'GET /test',
      'POST /api/auth/password/forgot-password',
      'POST /api/auth/password/reset-password',
      'POST /api/auth/password/change-password'
    ]
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`✅ KEVIN TEST SERVER: http://localhost:${PORT}`);
  console.log('====================================');
  console.log('📝 Test with Postman:');
  console.log('POST http://localhost:3001/api/auth/password/forgot-password');
  console.log('Body (JSON): {"email": "test@example.com"}');
  console.log('====================================');
});
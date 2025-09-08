// server.js - EMERGENCY MINIMAL VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ULTRA SIMPLE CORS - Should work with everything
app.use(cors({
  origin: "*", // Allow all origins
  methods: "*", // Allow all methods
  allowedHeaders: "*", // Allow all headers
  credentials: false // Disable credentials for simplicity
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Test Successful!', 
    origin: req.get('Origin') || 'No origin',
    timestamp: new Date().toISOString()
  });
});

// Simple departments test route
app.get('/api/departments/public/list', (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: "1", name: "IT Department" },
      { _id: "2", name: "HR Department" },
      { _id: "3", name: "Finance Department" }
    ]
  });
});

// Simple auth test route
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Test login endpoint - replace with real auth later'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Emergency server running on port ${PORT}`);
});
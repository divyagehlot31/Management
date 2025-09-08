// server.js - FINAL PRODUCTION VERSION
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from './routes/auth.js'
import connectToDatabase from "./db/db.js";
import departmentRoutes from "./routes/departmentRoutes.js"
import employeeRoutes from "./routes/employeeRoutes.js" 
import salaryRoutes from "./routes/salaryRoutes.js";
import paySalaryRoutes from "./routes/PaySalaryRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

// Load environment variables
dotenv.config();

// Connect to database
connectToDatabase();

const app = express();

// CORS Configuration - CRITICAL FOR VERCEL + RAILWAY
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://ems-portal-beryl.vercel.app',
      'https://ems-portal-git-main-divya-gehlots-projects.vercel.app',
      'https://ems-portal-k8l5fnouq-divya-gehlots-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:3001'
    ];
    
    // Check exact match first
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any vercel preview URLs for your project
    if (origin && origin.includes('vercel.app') && origin.includes('ems-portal')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Origin:', req.get('Origin'));
    console.log('Headers:', req.headers.authorization ? 'Auth present' : 'No auth');
    next();
  });
}

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EMS Portal API is running!', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/paysalary', paySalaryRoutes);
app.use('/api/leaves', leaveRoutes);

// Test route for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API Test Successful!', 
    timestamp: new Date().toISOString(),
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent')
  });
});

// 404 handler - Must come after all routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/test',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/departments/public/list'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation',
      origin: req.get('Origin')
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Connection string missing'}`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Loaded' : 'Missing'}`);
});
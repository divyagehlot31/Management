// index.js (or server.js)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from './routes/auth.js';
import connectToDatabase from "./db/db.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import paySalaryRoutes from "./routes/PaySalaryRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

dotenv.config();

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  "https://ems-portal-beryl.vercel.app",
  "https://ems-portal-git-main-divya-gehlots-projects.vercel.app",
  "https://ems-portal-k8l5fnouq-divya-gehlots-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

// CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/paysalary", paySalaryRoutes);
app.use("/api/leaves", leaveRoutes);

// Test
app.get('/api/test', (req,res) => res.json({message:"Server is working!", timestamp:new Date().toISOString()}));
app.get('/', (req,res) => res.send("Server is running!"));

// Start server after DB connects
const PORT = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });

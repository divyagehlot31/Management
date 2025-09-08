// server.js
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

dotenv.config();
connectToDatabase()

const app = express();

// Updated CORS configuration with correct URLs
app.use(cors({
  origin: [
    "https://ems-portal-beryl.vercel.app",           // Your actual Vercel URL
    "https://ems-portal-git-main-divya-gehlots-projects.vercel.app", // Git branch URL
    "https://ems-portal-k8l5fnouq-divya-gehlots-projects.vercel.app", // Preview URL
    "http://localhost:3000",                          // For local development
    "http://localhost:5173"                           // For Vite dev server
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter)
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/paysalary", paySalaryRoutes);
app.use("/api/leaves", leaveRoutes);

// Add a test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

console.log("Server starting...");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
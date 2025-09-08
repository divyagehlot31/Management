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
// app.use(cors());
app.use(cors({
  origin: ["https://your-vercel-app.vercel.app"], // <-- yaha apna Vercel URL daalo
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter)
app.use("/api/departments", departmentRoutes);

app.use("/api/employees", employeeRoutes); // Add this
app.use("/api/salaries", salaryRoutes);
app.use("/api/paysalary", paySalaryRoutes);
app.use("/api/leaves", leaveRoutes);




console.log("Server starting...");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
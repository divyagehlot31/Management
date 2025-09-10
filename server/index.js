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
import taskRoutes from "./routes/taskRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"

dotenv.config();
connectToDatabase();

const app = express();

// CORS config
app.use(cors({
  origin: ["https://frontend-opze.onrender.com"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/paysalary", paySalaryRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/notifications", notificationRoutes);



console.log("Server starting...");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

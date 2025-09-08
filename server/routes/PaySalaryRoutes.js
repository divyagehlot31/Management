import express from "express";
import { getSalaries, addSalary } from "../controllers/PaySalaryController.js";

const router = express.Router();

router.get("/", getSalaries);
router.post("/", addSalary); // new route to pay salary

export default router;

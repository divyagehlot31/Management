import mongoose from "mongoose";

mongoose.connect("mongodb+srv://divya3112:divya3112@cluster0.hhzm1zz.mongodb.net/ems?retryWrites=true&w=majority")
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch(err => console.error("❌ Connection failed:", err));

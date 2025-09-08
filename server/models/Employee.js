const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: "employee" },
  phone: String,
  dateOfBirth: Date,
  joinDate: { type: Date, default: Date.now },
  department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
}


});

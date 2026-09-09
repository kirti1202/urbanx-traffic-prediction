import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:      String,
  email:     { type: String, unique: true },
  password:  String,
  isVerified: { type: Boolean, default: false },

  // OTP fields
  otp:        String,   // hashed OTP stored here
  otpExpires: Date
});

export default mongoose.model("User", userSchema);
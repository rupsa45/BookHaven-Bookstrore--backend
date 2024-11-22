import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const createUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 8 length",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({
      success: true,
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Failed to create user",
    });
  }
};


export const loginUser =async(req,res)=>{
  const {email,password}=req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found"})
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }
    const token = createToken(user._id);
    res.json({
      success: true,
      message: "User logged in successfully",
      token
    })
  } catch (error) {
    console.log();
    return res.json({
      success:false,
      message:"Failed to login user"
    })
  }
}
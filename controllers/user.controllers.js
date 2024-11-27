import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import validator from "validator";

import Book from "../models/addBooks.model.js";
import generateToken from "../utils/generateTokens.js";

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
    const token = generateToken(res, user._id);
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

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill in all fields" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }
    const token = generateToken(res, user._id);
    res.json({
      success: true,
      message: "User logged in successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Failed to login user",
    });
  }
};


export const searchBooks = async (req, res) => {
  try {
    const { title, author, category } = req.params; // Extract route parameters

    // Create a dynamic filter object based on provided route parameters
    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // Case-insensitive match for title
    }
    if (author) {
      filter.author = { $regex: author, $options: "i" }; // Case-insensitive match for author
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" }; // Case-insensitive match for category
    }

    // Fetch books based on the filter
    const books = await Book.find(filter);

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found matching your query" });
    }

    res.status(200).json(books);
  } catch (error) {
    console.error("Error searching for books:", error);
    res
      .status(500)
      .json({ message: "Error searching for books", error: error.message });
  }
};

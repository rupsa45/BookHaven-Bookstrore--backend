import express from "express";
import multer from "multer";
import path from "path";
import Book from "../models/addBooks.model.js";
import { fetchAllBooks } from "../controllers/books.controllers.js";
const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage" && !file.mimetype.startsWith("image/")) {
    cb(new Error("Cover image must be an image file"));
  } else if (file.fieldname === "pdfFile" && file.mimetype !== "application/pdf") {
    cb(new Error("Book file must be a PDF"));
  } else {
    cb(null, true);
  }
};

// Configure multer with both storage and fileFilter
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter, // Added fileFilter
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (adjust as needed)
  }
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'pdfUrl', maxCount: 1 }
]);

// Route handler
router.post("/books", (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({ message: "File upload error", error: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({ message: "Error", error: err.message });
    }
    try {
      // Check if files exist
      if (!req.files || !req.files["coverImage"] || !req.files["pdfUrl"]) {
        return res.status(400).json({ message: "Both cover image and PDF file are required" });
      }

      const { title, author, rating, category, summary } = req.body;

      // Create relative paths for files
      const coverImage = req.files["coverImage"]?.[0]?.path;
      const pdfUrl = req.files["pdfUrl"]?.[0]?.path;

      const newBook = new Book({
        title,
        author,
        rating,
        category,
        summary,
        coverImage,
        pdfUrl,
      });

      await newBook.save();

      res.status(201).json({ 
        message: "Book added successfully", 
        book: newBook 
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error uploading book", 
        error: error.message 
      });
    }
  });
});

router.get("/books",fetchAllBooks);
export default router;

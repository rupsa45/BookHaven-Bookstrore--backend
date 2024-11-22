import express from "express";
import multer from "multer";
import path from "path";
import Book from "../models/addBooks.model.js";
import { downloadPdfById, fetchAllBooks } from "../controllers/books.controllers.js";
import { fileURLToPath } from "url";

const router = express.Router();

// Configure directory constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});


// Configure file filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Cover image must be an image file"));
  } else if (file.fieldname === "pdfUrl" && file.mimetype !== "application/pdf") {
    return cb(new Error("Book file must be a PDF"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "pdfUrl", maxCount: 1 },
]);

// Serve static files from uploads directory
router.use("/uploads", express.static(UPLOADS_DIR));


// Route to upload books
router.post("/books", (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error", error: err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error", error: err.message });
    }

    try {
      if (!req.files || !req.files["coverImage"] || !req.files["pdfUrl"]) {
        return res.status(400).json({ message: "Both cover image and PDF file are required" });
      }

      const { title, author, rating, category, summary } = req.body;

      // Normalize file paths for static serving
      const coverImage = `uploads/${path.basename(req.files["coverImage"][0].path)}`;
      const pdfUrl = `uploads/${path.basename(req.files["pdfUrl"][0].path)}`;

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
        book: newBook,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error uploading book",
        error: error.message,
      });
    }
  });
});

// Fetch all books
router.get("/books", fetchAllBooks);

// Route to download a book PDF by ID
router.get("/books/download/:id", downloadPdfById);

export default router;

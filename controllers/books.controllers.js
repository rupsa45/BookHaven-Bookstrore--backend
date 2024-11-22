import Book from "../models/addBooks.model.js";
import fs from 'fs';
import path from 'path';
export const fetchAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Fetch all books from the database
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch books. Please try again later." });
  }
};


const __dirname = path.resolve();

export const downloadPdfById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Construct the full file path
    const filePath = path.join(__dirname, book.pdfUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    // Send the file to the client
    res.download(filePath, path.basename(book.pdfUrl), (err) => {
      if (err) {
        console.error("Error during file download:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching book", error: error.message });
  }
};
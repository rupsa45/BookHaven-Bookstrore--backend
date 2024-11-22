import Book from '../models/addBooks.model.js'
export const fetchAllBooks = async (req, res) => {
    try {
      const books = await Book.find(); // Fetch all books from the database
      res.status(200).json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books. Please try again later." });
    }
}
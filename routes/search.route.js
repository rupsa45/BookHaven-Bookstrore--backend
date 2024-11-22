import express from 'express';
import { searchBooks } from '../controllers/user.controllers.js';

const router = express.Router();

router.get("/books/search/:title?", searchBooks);


export default router;

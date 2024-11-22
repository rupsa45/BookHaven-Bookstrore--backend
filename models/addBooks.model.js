import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    coverImage: {
        type: String, 
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        default: 0
    },
    category: {
        type: String,
        enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Romance','Cookbooks','Self-Help','Psychological-Thriller','Biography'], 
        required: true
    },
    pdfUrl: {
        type: String, 
        required: true
    },
    summary: {
        type: String,
        required: true
    }
}, {
    timestamps: true  
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
import express from "express"
import cors from 'cors'
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from 'cookie-parser';

dotenv.config({
    path: './.env'
})
const app=express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.get("/health",async(req,res)=>{
    res.send({meassage:"health is ok!"})
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 5000 ,()=>{
        console.log(`Server is running at port: http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Error connecting to database",error)
})
import userRouter from './routes/user.routes.js'
app.use("/api/users",userRouter)



import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount the upload routes under /api
app.use('/api', uploadRoutes);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; 
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import educatorRouter from './routes/educator.routes.js';
import authRouter from './routes/auth.routes.js';
import studentRouter from './routes/student.routes.js';
import adminRouter from './routes/admin.routes.js';

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();

const app = express();

 //Cross-Origin Resource Sharing
 app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));

 app.use(express.json());
 app.use(express.urlencoded({extended: true})); 

 app.use(cookieParser());
 
 app.use('/api/auth', authRouter);
 app.use('/api/admin', adminRouter);
 app.use('/api/student', studentRouter);
 app.use("/api/educator", educatorRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/routes.js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectMongoDB } from './config/dbConnection.js';
dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const limiter = rateLimit({
// 	windowMs: 1 * 60 * 1000, 
// 	limit: 5,
// 	standardHeaders: 'draft-8', 
// 	legacyHeaders: false, 
// 	ipv6Subnet: 56, 
// })

// app.use("/",limiter)
connectMongoDB();
registerRoutes(app);

app.listen(5003, () => {
  console.log('Server is running on port 5001');
});
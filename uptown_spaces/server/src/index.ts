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
registerRoutes(app);

const startServer = async () => {
  try {
    await connectMongoDB();
    const port = Number(process.env.PORT) || 5003;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
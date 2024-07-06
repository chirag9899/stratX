import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeFiles } from './utils';
import "./cronjob"
import "./eventHandler"
import balanceManager from './routes/balance_manger';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));
initializeFiles();

// creating routes
app.use("/api", balanceManager);


console.log('Application has started, listening for events and running cron jobs.');


app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
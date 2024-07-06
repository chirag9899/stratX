import express from 'express';
import axios from 'axios';
import { getUserBalance } from '../eventHandler';

const balanceManager = express.Router();

balanceManager.get('/strategies/:user', async (req, res) => {
    const user = req.params.user;
    const balance = getUserBalance(user);
    res.status(200).json(balance);
});

export default balanceManager;
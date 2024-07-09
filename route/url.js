import express from 'express';
const router = express.Router();
import ejs from 'ejs';
import { getTokenBalance, getTokenDetails, sendTokenToAddr } from '../utils/trc20.js';

router.get('/', async(req, res) =>{
    try{

        res.render('index');

    }catch(err){
        if(err.response){
            res.json(err.response);
        }
    }
});

router.get('/token', async(req, res) =>{
    try{
        const tokenData = await getTokenDetails();
        return res.render('buytoken', {tokenData: tokenData});

    }catch(err){
        if(err.response){
            res.json(err.response);
        }
    }
});



export default router;
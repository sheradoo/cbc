import dotenv  from "dotenv"
import express from 'express';
import ejs from 'ejs';
const app = express();


dotenv.config({path: './config/.env'});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'ejs');

let ejsoptions = { async: true };

app.engine('ejs', async (path, data, cb) =>{
  try{
     let html = await ejs.renderFile(path, data, ejsoptions);
     cb(null, html)
  }catch (e){
    cb(e, '');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static('views/public'));
app.use('/util', express.static('utils'));

import route from './route/index.js';
route(app);



const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Richie Api listening on port 👉 ${PORT}`)
});
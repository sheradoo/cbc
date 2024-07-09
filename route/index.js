import express from 'express';
const router = express.Router();

import url from './url.js';


const Home = router.get('/', (req, res) => res.json({message: "Richie Exchange Node API System"}));

// Define all routes of the API and error handling middleware.
const app = (app) => {
    // Routes.
    app.use(express.json());

    app.use("/", url);
  

    // Error route not found 404.
    app.all("*", (req, res) =>{
        return res.status(404).json({
            "404": 'Route Not Found!'
         });
    }); 
};

 export default app; 
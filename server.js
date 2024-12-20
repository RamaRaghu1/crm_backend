import {connectDB} from "./db/db.js";
import app from "./App.js";
import dotenv from "dotenv";


dotenv.config({
    path:"./.env"
})
connectDB().then(
    app.listen(process.env.PORT, ()=>{
        console.log(`server listening on ${process.env.PORT}`)
    })
)


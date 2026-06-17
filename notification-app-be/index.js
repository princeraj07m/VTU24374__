import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import log from "../logging-middleware/logger.js"

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.get("/", async (req,res)=>{
    await log("backend", "debug", "controller", "api")
    res.json({message : "Service running"})

})



app.listen(process.env.PORT || 8000 , ()=>{
    console.log(`Server on : ${process.env.PORT}`)
})
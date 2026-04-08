import dotenv from "dotenv";
// require('dotenv').config({path:'./env'});
import connectDB from "../src/db/index.js";
import app from "./app.js"

dotenv.config({
  path:'./.env'
})

connectDB()
.then(() =>{
  app.listen(process.env.PORT, () =>{
    console.log(`Server is running at :${process.env.PORT}`)
  })
})
.catch((err) => {
  console.log("MONGODB Connection failed!!",err);
  
})







/*
import express from "express";
const app = express()

( async () => {
  try{
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("ERROR: ",error);
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    })

  } catch(error){
    console.error("ERROR: ",error)
    throw err
  }
})()
  */
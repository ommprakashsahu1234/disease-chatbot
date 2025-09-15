import 'dotenv/config';
import express from "express";
import mongoose from 'mongoose';
import axio from "axios";
import path from "path";
import chatRoutes from "./routes/chat.js";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import cors from "cors";
let app=express();
let port=8080;
//fixing dir name in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine","ejs");
app.set('views',path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
app.use('/api',chatRoutes);
async function main() {
  mongoose.connect('mongodb://127.0.0.1:27017/chatDatabase');
}
main()
.then(() => console.log("MongoDB connected to chatDatabase"))
.catch(err => console.error("MongoDB connection error:", err));
app.listen(port,()=>{
    console.log("app is listening at the port:",port);
});
// app.use(cors());
// const client = new OpenAI({
//         apiKey: process.env.OPENAI_API_KEY,
// });
// app.get('/',async(req,res)=>{
//     try {
//         const response = await client.responses.create({
//         model: 'gpt-4o-mini',
//         instructions: 'You are a coding assistant that talks like a pirate',
//         input: 'give me a joke related to computer science',
//         });
//         res.send(response.output_text);
//     } catch (error) {
//         res.status(400).send("bad request");
//     }
// })
// app.post('/test',async(req,res)=>{
//     try {
//         const url="https://api.openai.com/v1/chat/completions";
//         const response=await axio.post(url,{
//             model:"gpt-4o-mini",
//             messages:[
//                 {
//                 role: "user",
//                 content:req.body.messages
//                 }
//             ]
//         },{
//             headers:{
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` 
//             }
//         });
//         console.log(response.data.choices[0].message.content);
//         res.json(response.data);
//     } catch (error) {
//         res.status(400).send("Bad Request");
//     }
// })

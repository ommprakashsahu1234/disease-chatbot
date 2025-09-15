import express from "express";
import Thread from "../models/thread.js";
import {classifyQuery,getOpenAiApiResponse} from "../utils/openAi.js";
const router=express.Router();
//test db save
router.post('/test',async(req,res)=>{
    try {
        const thread1=new Thread({
            threadId:"xyz12",
            title:"Testing a another thread"
        })
        const response=await thread1.save();
        res.json(response);
    } catch (error) {
        res.status(404).send("Failed to connect DB");
    }
})
//get all the threads
router.get('/threads',async(req,res)=>{
    const threads=await Thread.find();
    res.json(threads);
});
//get single thread
router.get('/threads/:id',async(req,res)=>{
    try {
        let id=req.params.id;
        const singleThread=await Thread.findOne({threadId:id});
        res.json(singleThread);
    } catch (error) {
        res.status(400).send("unable to fetch");
    }
});
//delete thread
router.delete('/threads/:id',async(req,res)=>{
    try {
        let id=req.params.id;
        const deleteThread=await Thread.findOneAndDelete({threadId:id});
        if(!deleteThread){
            res.status(404).send("Thread is not deleted");
        }
        res.status(200).send("Thread successfully deleted");
    } catch (error) {
        res.status(400).send("unable to fetch");
    }
});
//chat route with health filter
router.post('/chat',async(req,res)=>{
    const {threadId,message}=req.body;
    if(!threadId || !message){
        res.status(400).json({error:"Missing the requiring field"});
    }
    try {
        //step-1 : clarify message
        const isHealth = await classifyQuery(message);

        if (isHealth !== "YES") {
            return res.json({
                reply: "❌ I can only provide health-related advice. Please ask a health-related question.",
                threadId
            });
        }
        //step-2 : find or create thread
        let thread=await Thread.findOne({threadId});
        if(!thread){
            thread=new Thread({
                threadId,
                title:message,
                messages:[{role:"user",content:message}]
            });
        }else{
            thread.messages.push({role:"user",content:message})
        }
        //step-3 : get ai response
        const assistantReply=await getOpenAiApiResponse(message);
        thread.messages.push({role:"assistant",content:assistantReply});
        thread.updatedAt=Date.now();
        await thread.save();
        res.json({reply:assistantReply,threadId:thread.threadId});
    } catch (error) {
        res.status(500).json({ error: "Failed to process chat" });
    }
});
export default router;
"use server"


import mongoose from "mongoose";

let isConnected=false;

export async function connectToDB() {
    mongoose.set('strictQuery',true);

    if(!process.env.MONGODB_URL){
        return console.log("mong db url is not defined");
    }

    if(isConnected){
        return console.log('=>using exhisting db connection');
    }

    try{
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected=true;

    }catch(error){
        console.log(error);

    }
    
}
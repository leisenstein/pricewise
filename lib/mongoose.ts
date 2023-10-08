import mongoose from 'mongoose';

let isConnected = false;


export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    let connectionString = process.env.MONGODB_URI;
    console.log("===  file: mongoose.ts:10  connectionString ===", connectionString);

    if(!connectionString) return console.log('MONGODB_URI is not defined');

    
    if(isConnected) return console.log('=> using existing database connection');

    try {
        console.log('TRYING..................')
        await mongoose.connect(connectionString);

        isConnected = true;
        console.log('MongoDB Connected');
    } catch (error) {
        console.log("=== mongoose error ===", error);
    }
}
import dotenv from 'dotenv';

dotenv.config()

export const env= {
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://mongo:27017/leaveflow',
};
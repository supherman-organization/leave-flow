import app from "./app";
import { connectDB } from  './config/db';
import { env } from './config/env';

async function start() {
    try{
        await connectDB();
        app.listen(env.port, () => {
            console.log(`Backend prêt sur http://localhost:${env.port}`);
        });
    }catch (err) {
        console.error(' Démarrage impossible :', err);
        process.exit(1);
    }
}
start()
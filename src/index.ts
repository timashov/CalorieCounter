import { createConnection } from 'typeorm';
import { app } from './server';

const start = async () => {
    const connection = await createConnection();
    console.log('Connected to db!');
    
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Listening on port ${port}.`);
    });
}

start();
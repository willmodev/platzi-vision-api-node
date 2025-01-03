import express from 'express';
import cors from 'cors';
import chatRoutes from '../routes/chat.js';

export class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
            chat: '/api/chat'
        }

        this.middlewares();

        this.routes();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
    }

    routes() {
        this.app.use(this.paths.chat, chatRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import './helpers/db-connections.js';
import user from './routers/user.js';

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/api/users', user);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
//localhost:8000/public/{uploads/images}

app.listen(PORT, () => { console.log(`app is listening at http://localhost:${PORT}`); })
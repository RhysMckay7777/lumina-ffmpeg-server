import express from 'express';
import cors from 'cors';
import config from './config/storage.js';
import routes from './api/routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(config.uploadsDir));
app.use('/outputs', express.static(config.outputsDir));

// Use modular routes
app.use('/', routes);

export default app;

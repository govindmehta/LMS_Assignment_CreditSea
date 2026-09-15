// src/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import opsRoutes from './routes/opsRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Static file serving for uploaded salary slips
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/ops', opsRoutes);

export default app;
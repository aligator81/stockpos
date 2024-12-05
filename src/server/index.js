import express from 'express';
import cors from 'cors';
import authRoutes from './auth.js';

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
    origin: 'http://localhost:5173', // Remplacez par l'URL de votre frontend
    credentials: true, // Permet l'envoi de cookies et d'en-têtes d'authentification
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

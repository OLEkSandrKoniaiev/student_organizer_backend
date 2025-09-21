import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(express.json());

app.use(cors());

// Підключаємо Morgan middleware залежно від середовища
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Шляхи
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Базовий запит
app.get('/', (_req, res) => {
  res.send('Hello World');
});

export default app;

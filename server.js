const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user.routes');
const userAccountRoutes = require('./routes/userAccount.routes'); // Import userAccount routes
const courseRoutes = require('./routes/course.routes'); // Import course routes
const paymentRoutes = require('./routes/payment.routes'); // Import payment routes

const app = express();

// Middleware CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Update to your frontend's domain
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

// Use cookie-parser
app.use(cookieParser());

// Rate limit middleware
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per windowMs
  message: 'Too many accounts created from this IP, please try again later.',
});
app.use('/api/users/register', registerLimiter);
app.use('/api/users/login', registerLimiter);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/user-accounts', userAccountRoutes); // Use userAccount routes
app.use('/api/courses', courseRoutes); // Use course routes
app.use('/api/payments', paymentRoutes); // Use payment routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

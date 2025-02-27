const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const userAccountRoutes = require('./routes/userAccount.routes'); // Import userAccount routes
const userGroupRouter = require('./routes/userGroup.routes'); // Import userGroup routes

const courseRoutes = require('./routes/course.routes'); // Import course routes
const tryoutRoutes = require('./routes/tryout.routes');
const userTryoutTestRoutes = require('./routes/userTryoutTest.routes');
const questionRoutes = require('./routes/question.routes');
const examRoutes = require('./routes/exam.routes');
const examOrderRoutes = require('./routes/examOrder.routes');
const scoreRoutes = require('./routes/userExamAnswers.routes');
const userExamRoutes = require('./routes/userExam.routes');
const examScheduleRoutes = require('./routes/examSchedule.routes');
const eventRoutes = require('./routes/event.routes');
const classRoutes = require('./routes/class.routes');


const authenticateRole = require('./middleware/authenticateRole'); // Sesuaikan dengan path middleware Anda
const authenticateJWT = require('./middleware/authenticateToken');

const productRoutes = require('./routes/products.routes');
const productTypeRoutes = require('./routes/productType.routes');
const orderRoutes = require('./routes/orders.routes');
const paymentRoutes = require('./routes/payments.routes');
const transactionRoutes = require('./routes/transaction.routes');

const attendanceTypeRoutes = require('./routes/attendanceType.routes');
const sessionRoutes = require('./routes/session.routes');
const codeAttendanceRoutes = require('./routes/codeAttendance.routes');
const attendanceRoutes = require('./routes/attendance.routes');


const app = express();

// Middleware CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'https://futuredu-frontend.vercel.app'], // Tambahkan URL frontend Vercel Anda
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};
app.use(cors(corsOptions));

// Use cookie-parser
app.use(cookieParser());

// Rate limit middleware
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 100 requests per windowMs
  message: 'Too many accounts created from this IP, please try again later.',
});
app.use('/api/users/register', registerLimiter);
app.use('/api/users/login', registerLimiter);

app.use(helmet());
// Menyesuaikan ukuran maksimal body yang diterima
app.use(bodyParser.json({ limit: '50mb' })); // batas ukuran payload menjadi 50MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Use routes
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/user-accounts', userAccountRoutes); // Use userAccount routes
app.use('/api/user-groups', userGroupRouter);

app.use('/api/courses', courseRoutes); // Use course routes
app.use('/api/payments', paymentRoutes); // Use payment routes
app.use('/api/tryout', tryoutRoutes); // Use to routes
app.use('/api/user_tryout_tests', userTryoutTestRoutes);  
app.use('/api/questions', questionRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/examOrder', examOrderRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/userExam', userExamRoutes);
app.use('/api/exam-schedules', examScheduleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance-types', attendanceTypeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/code-attendance', codeAttendanceRoutes);
app.use('/api/attendances', attendanceRoutes);   
app.use('/api/productType', productTypeRoutes)

const PORT = process.env.PORT || 5000 || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';

// Load env first

// Then load services that depend on env
import './service/reminder.js';

// routes
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import filesRouter from './routes/files.route.js';
import studyListRouter from './routes/studyList.route.js';
import notificationRouter from './routes/notification.route.js';
import searchRouter from './routes/search.route.js';
import subjectsRouter from './routes/subjects.route.js';
import dashboardRouter from './routes/admin/dashboard.route.js';
import filesStatusRouter from './routes/admin/filesStatus.route.js';
import reportedFilesRouter from './routes/admin/ReportedFiles.route.js';
import sendAiRouter from './routes/ai/sendAi.route.js';
// config
import Cors from './config/cors.js';
import httpsRedirect from './middleware/httpsRedirect.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import './config/passport.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();

app.use(helmet());
console.log('this is the mode :', process.env.NODE_ENV);
app.use(Cors);

const authSwagger = YAML.load('./swagger/authSwagger.yaml');
const userSwagger = YAML.load('./swagger/user/userSwagger.yaml');
const filesSwagger = YAML.load('./swagger/user/filesSwagger.yaml');
const studyListSwagger = YAML.load('./swagger/user/studyListSwagger.yaml');
const searchSwagger = YAML.load('./swagger/allActurSwagger.yaml');
const subjectsSwagger = YAML.load('./swagger/user/subjectsSwagger.yaml');
const notificationSwagger = YAML.load(
  './swagger/user/notificationSwagger.yaml'
);
const adminDashboardSwagger = YAML.load(
  './swagger/admin/dashboardSwagger.yaml'
);
const adminFilesStatusSwagger = YAML.load(
  './swagger/admin/filesStatusSwagger.yaml'
);
const adminReportedFilesSwagger = YAML.load(
  './swagger/admin/reportedFilesSwagger.yaml'
);
const aiSwagger = YAML.load('./swagger/ai/aiSwagger.yaml');

const swaggerDocument = {
  ...authSwagger,
  tags: [
    ...(authSwagger?.tags || []),
    ...(userSwagger?.tags || []),
    ...(filesSwagger?.tags || []),
    ...(studyListSwagger?.tags || []),
    ...(searchSwagger?.tags || []),
    ...(subjectsSwagger?.tags || []),
    ...(notificationSwagger?.tags || []),
    ...(adminDashboardSwagger?.tags || []),
    ...(adminFilesStatusSwagger?.tags || []),
    ...(adminReportedFilesSwagger?.tags || []),
    ...(aiSwagger?.tags || []),
  ],
  paths: {
    ...(authSwagger?.paths || {}),
    ...(userSwagger?.paths || {}),
    ...(filesSwagger?.paths || {}),
    ...(studyListSwagger?.paths || {}),
    ...(searchSwagger?.paths || {}),
    ...(subjectsSwagger?.paths || {}),
    ...(notificationSwagger?.paths || {}),
    ...(adminDashboardSwagger?.paths || {}),
    ...(adminFilesStatusSwagger?.paths || {}),
    ...(adminReportedFilesSwagger?.paths || {}),
    ...(aiSwagger?.paths || {}),
  },
};

if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production') {
  app.use(httpsRedirect);
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

//user routes

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/files', filesRouter);
app.use('/api/studyList', studyListRouter);
app.use('/api/notification', notificationRouter);
app.use('/api/search', searchRouter);
app.use('/api/subjects', subjectsRouter);

//admin routes
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/admin/filesStatus', filesStatusRouter);
app.use('/api/admin/reportedFiles', reportedFilesRouter);

//ai routes
app.use('/api/ai', sendAiRouter);

//swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Server running on port http://localhost:${port}`);
});

// Trigger restart

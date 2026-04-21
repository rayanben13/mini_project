import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load env first
dotenv.config();

// Then load services that depend on env
import './service/reminder.js';

// routes
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import filesRouter from './routes/files.route.js';
import studyListRouter from './routes/studyList.route.js';

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
const userSwagger = YAML.load('./swagger/userSwagger.yaml');

const swaggerDocument = {
  ...authSwagger,
  tags: [...(authSwagger?.tags || []), ...(userSwagger?.tags || [])],
  paths: {
    ...(authSwagger?.paths || {}),
    ...(userSwagger?.paths || {}),
  },
};

if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'production') {
  app.use(httpsRedirect);
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

//Router

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/files', filesRouter);
app.use('/api/studyList', studyListRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Server running on port http://localhost:${port}`);
});

// Trigger restart

import express from 'express';

import helmet from 'helmet';

// routes
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

// config
import Cors from './config/cors.js';
import httpsRedirect from './middleware/httpsRedirect.js';

import cookieParser from 'cookie-parser';

import passport from 'passport';

import './config/passport.js';

import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

import YAML from 'yamljs';

dotenv.config();

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

if (process.env.NODE_ENV.trim() === 'production') {
  app.use(httpsRedirect);
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Server running on port http://localhost:${port}`);
});

// Trigger restart

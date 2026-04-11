import express from 'express';

import helmet from 'helmet';
import authRouter from './routes/auth.route.js';
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

const swaggerDocument = YAML.load('./swagger/authSwagger.yaml');

if (process.env.NODE_ENV.trim() === 'production') {
  app.use(httpsRedirect);
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`🚀 Server running on port http://localhost:${port}`);
});

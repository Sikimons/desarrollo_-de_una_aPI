import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import type { Express } from 'express';
import type { EmployeeController } from './controllers/empleados.controllers.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/error.middleware.js';
import { createEmployeeRouter } from './routes/empleados.routes.js';
import { ResponseWrapper } from './utils/response-wrapper.js';

export const createApp = (controller: EmployeeController): Express => {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cors());

  app.get('/health', (_req, res) => {
    ResponseWrapper.success(res, 200, 'Servicio disponible', { status: 'ok' });
  });

  const employeeRouter = createEmployeeRouter(controller);
  app.use('/api/v1/empleados', employeeRouter);
  app.use('/api/v1/employees', employeeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

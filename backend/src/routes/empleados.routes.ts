import { Router } from 'express';
import type { EmployeeController } from '../controllers/empleados.controllers.js';
import {
  createEmployeeRequestSchema,
  employeeParamsRequestSchema,
  updateEmployeeRequestSchema,
} from '../dtos/employee.dto.js';
import { validateRequest } from '../middlewares/validation.middleware.js';

export const createEmployeeRouter = (
  controller: EmployeeController,
): Router => {
  const router = Router();

  router.get('/', controller.getEmployees);
  router.post(
    '/',
    validateRequest(createEmployeeRequestSchema),
    controller.createEmployee,
  );
  router.put(
    '/:id',
    validateRequest(updateEmployeeRequestSchema),
    controller.updateEmployee,
  );
  router.delete(
    '/:id',
    validateRequest(employeeParamsRequestSchema),
    controller.deleteEmployee,
  );

  return router;
};

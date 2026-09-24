import type { NextFunction, Request, Response } from 'express';
import type { IEmployeeRepository } from '../repositories/employee.repository.js';
import type {
  CreateEmployeeDto,
  EmployeeParamsDto,
  UpdateEmployeeDto,
} from '../dtos/employee.dto.js';
import { AppError } from '../errors/app.error.js';
import { ResponseWrapper } from '../utils/response-wrapper.js';

export class EmployeeController {
  constructor(
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  getEmployees = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employees = await this.employeeRepository.findAll();
      ResponseWrapper.success(
        res,
        200,
        'Empleados obtenidos correctamente',
        employees,
      );
    } catch (error) {
      next(error);
    }
  };

  createEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const employee = await this.employeeRepository.create(
        req.body as CreateEmployeeDto,
      );
      ResponseWrapper.success(
        res,
        201,
        'Empleado creado correctamente',
        employee,
      );
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as EmployeeParamsDto;

      const employee = await this.employeeRepository.updateById(
        id,
        req.body as UpdateEmployeeDto,
      );

      if (!employee) {
        throw new AppError('Empleado no encontrado', 404);
      }

      ResponseWrapper.success(
        res,
        200,
        'Empleado actualizado correctamente',
        employee,
      );
    } catch (error) {
      next(error);
    }
  };

  deleteEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as EmployeeParamsDto;

      const deleted = await this.employeeRepository.deleteById(id);
      if (!deleted) {
        throw new AppError('Empleado no encontrado', 404);
      }

      ResponseWrapper.success(
        res,
        200,
        'Empleado eliminado correctamente',
        { id },
      );
    } catch (error) {
      next(error);
    }
  };
}

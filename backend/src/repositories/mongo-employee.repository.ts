import type { HydratedDocument } from 'mongoose';
import {
  EmployeeModel,
  type EmployeePersistence,
} from '../models/empleado.js';
import type {
  CreateEmployee,
  Employee,
  IEmployeeRepository,
  UpdateEmployee,
} from './employee.repository.js';

export class MongoEmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<Employee[]> {
    const documents = await EmployeeModel.find().exec();
    return documents.map((document) => this.toDomain(document));
  }

  async create(employee: CreateEmployee): Promise<Employee> {
    const document = await EmployeeModel.create(employee);
    return this.toDomain(document);
  }

  async updateById(
    id: string,
    employee: UpdateEmployee,
  ): Promise<Employee | null> {
    const document = await EmployeeModel.findByIdAndUpdate(id, employee, {
      new: true,
      runValidators: true,
    }).exec();

    return document ? this.toDomain(document) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const document = await EmployeeModel.findByIdAndDelete(id).exec();
    return document !== null;
  }

  private toDomain(
    document: HydratedDocument<EmployeePersistence>,
  ): Employee {
    return {
      id: document._id.toString(),
      nombre: document.nombre,
      cargo: document.cargo,
      departamento: document.departamento,
      sueldo: document.sueldo,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}

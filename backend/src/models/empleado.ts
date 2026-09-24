import { model, Schema } from 'mongoose';

export interface EmployeePersistence {
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<EmployeePersistence>(
  {
    nombre: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    sueldo: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const EmployeeModel = model<EmployeePersistence>(
  'Empleado',
  employeeSchema,
);

import { z } from 'zod';

const employeeFieldsSchema = z
  .object({
    nombre: z
      .string({ error: 'El nombre debe ser texto' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    cargo: z
      .string({ error: 'El cargo debe ser texto' })
      .trim()
      .min(2, 'El cargo debe tener al menos 2 caracteres')
      .max(100, 'El cargo no puede exceder 100 caracteres'),
    departamento: z
      .string({ error: 'El departamento debe ser texto' })
      .trim()
      .min(2, 'El departamento debe tener al menos 2 caracteres')
      .max(100, 'El departamento no puede exceder 100 caracteres'),
    sueldo: z
      .number({ error: 'El sueldo debe ser numérico' })
      .finite('El sueldo debe ser un número finito')
      .positive('El sueldo debe ser mayor que cero'),
  })
  .strict();

export const createEmployeeSchema = employeeFieldsSchema;

export const updateEmployeeSchema = employeeFieldsSchema
  .partial()
  .refine((employee) => Object.keys(employee).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

export const employeeParamsSchema = z
  .object({
    id: z
      .string({ error: 'El id debe ser texto' })
      .regex(/^[a-f\d]{24}$/i, 'El id debe ser un ObjectId válido'),
  })
  .strict();

export const createEmployeeRequestSchema = z.object({
  body: createEmployeeSchema,
});

export const updateEmployeeRequestSchema = z.object({
  body: updateEmployeeSchema,
  params: employeeParamsSchema,
});

export const employeeParamsRequestSchema = z.object({
  params: employeeParamsSchema,
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type EmployeeParamsDto = z.infer<typeof employeeParamsSchema>;

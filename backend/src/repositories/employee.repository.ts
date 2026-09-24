export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEmployee = Pick<
  Employee,
  'nombre' | 'cargo' | 'departamento' | 'sueldo'
>;

export type UpdateEmployee = {
  [Field in keyof CreateEmployee]?: CreateEmployee[Field] | undefined;
};

/**
 * Contrato de persistencia consumido por la capa HTTP.
 */
export interface IEmployeeRepository {
  findAll(): Promise<Employee[]>;
  create(employee: CreateEmployee): Promise<Employee>;
  updateById(id: string, employee: UpdateEmployee): Promise<Employee | null>;
  deleteById(id: string): Promise<boolean>;
}

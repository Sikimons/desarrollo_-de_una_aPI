export interface EmployeeDraft {
  readonly nombre: string;
  readonly cargo: string;
  readonly departamento: string;
  readonly sueldo: number;
}

export interface Employee extends EmployeeDraft {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T | null;
  readonly errors: readonly { field: string; message: string; code?: string }[] | null;
  readonly timestamp: string;
}

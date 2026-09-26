import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { Employee } from './employee.model';
import { EmployeeService } from './employee.service';

describe('EmployeeService: referencias inmutables', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('crea, actualiza y elimina sin alterar las listas emitidas previamente', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(EmployeeService);
    const http = TestBed.inject(HttpTestingController);
    const emissions: (readonly Employee[])[] = [];
    const subscription = service.employees$.subscribe((employees) => emissions.push(employees));
    const employee: Employee = Object.freeze({ id: 'abc', nombre: 'Ana Torres', cargo: 'Analista', departamento: 'TI', sueldo: 1000, createdAt: '', updatedAt: '' });
    const response = (data: unknown) => ({ success: true, data });
    const url = '/api/v1/employees';
    service.load().subscribe();
    http.expectOne(url).flush(response([employee]));
    const original = emissions.at(-1)!;
    Object.freeze(original);

    service.save({ nombre: 'Luis Pérez', cargo: 'Analista', departamento: 'TI', sueldo: 1100 }).subscribe();
    http.expectOne(url).flush(response({ ...employee, id: 'def', nombre: 'Luis Pérez' }));
    const afterCreate = emissions.at(-1)!;
    expect(afterCreate).not.toBe(original);
    expect(original).toHaveLength(1);
    expect(afterCreate).toHaveLength(2);
    Object.freeze(afterCreate);

    service.save({ ...employee, nombre: 'Ana Actualizada' }, employee.id).subscribe();
    http.expectOne(`${url}/abc`).flush(response({ ...employee, nombre: 'Ana Actualizada' }));
    const afterUpdate = emissions.at(-1)!;
    expect(afterUpdate).not.toBe(afterCreate);
    expect(afterCreate[0].nombre).toBe('Ana Torres');
    expect(afterUpdate[0].nombre).toBe('Ana Actualizada');
    Object.freeze(afterUpdate);

    service.remove(employee.id).subscribe();
    http.expectOne(`${url}/abc`).flush(response({ id: employee.id }));
    expect(emissions.at(-1)).toHaveLength(1);
    expect(afterUpdate).toHaveLength(2);
    subscription.unsubscribe();
  });
});

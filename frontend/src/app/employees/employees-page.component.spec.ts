import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { Employee } from './employee.model';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeesPageComponent } from './employees-page.component';

const url = '/api/v1/employees';
const employee: Employee = Object.freeze({
  id: '507f1f77bcf86cd799439011', nombre: 'Ana Torres', cargo: 'Analista',
  departamento: 'Tecnología', sueldo: 1500,
  createdAt: '2026-09-23T00:00:00Z', updatedAt: '2026-09-23T00:00:00Z',
});
const response = (data: unknown) => ({ success: true, message: 'OK', data, errors: null, timestamp: '' });

describe('Gestión de empleados: contenedor y componentes presentacionales', () => {
  let fixture: ComponentFixture<EmployeesPageComponent>;
  let http: HttpTestingController;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeesPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(EmployeesPageComponent);
    http = TestBed.inject(HttpTestingController);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => { http.verify(); vi.restoreAllMocks(); });

  async function load(employees: readonly Employee[] = [employee]) {
    http.expectOne(url).flush(response(employees));
    await fixture.whenStable();
  }

  function click(label: string) {
    const button = Array.from(root.querySelectorAll('button')).find((item) =>
      item.textContent?.trim() === label);
    if (!button) throw new Error(`No se encontró el botón ${label}`);
    button.click();
    fixture.detectChanges();
  }

  function input(name: string, value: string) {
    const field = root.querySelector<HTMLInputElement>(`#${name}`)!;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function submit() {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('carga los datos usando async y cancela la edición sin modificar la tabla', async () => {
    await load();
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Torres');
    click('Editar');
    input('nombre', 'Nombre sin guardar');
    expect(employee.nombre).toBe('Ana Torres');
    expect(root.querySelector('tbody')!.textContent).not.toContain('Nombre sin guardar');
    click('Cancelar');
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('');
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Torres');
    http.expectNone(url);
  });

  it('crea un empleado con el DTO y limpia el formulario solo después del éxito', async () => {
    await load([]);
    input('nombre', '  Luis Pérez  ');
    input('cargo', 'Diseñador');
    input('departamento', 'Producto');
    input('sueldo', '2200');
    submit();
    const request = http.expectOne({ method: 'POST', url });
    expect(request.request.body).toEqual({ nombre: 'Luis Pérez', cargo: 'Diseñador', departamento: 'Producto', sueldo: 2200 });
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('  Luis Pérez  ');
    request.flush(response({ ...employee, ...request.request.body }));
    await fixture.whenStable();
    expect(root.querySelector('tbody')!.textContent).toContain('Luis Pérez');
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('');
    expect(root.querySelector('[role="status"]')!.textContent).toContain('guardado');
  });

  it('conserva el borrador y la tabla al fallar, permite reintentar e impide envíos simultáneos', async () => {
    await load();
    click('Editar');
    input('nombre', 'Ana Actualizada');
    submit();
    submit();
    const request = http.expectOne({ method: 'PUT', url: `${url}/${employee.id}` });
    expect(request.request.body.id).toBeUndefined();
    request.flush({ message: 'No se pudo guardar.' }, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')!.textContent).toContain('No se pudo guardar.');
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('Ana Actualizada');
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Torres');
    submit();
    http.expectOne(`${url}/${employee.id}`).flush(response({ ...employee, nombre: 'Ana Actualizada' }));
    await fixture.whenStable();
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Actualizada');
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('');
  });

  it('valida textos en blanco y sueldo positivo antes de emitir el guardado', async () => {
    await load();
    input('nombre', '   ');
    input('cargo', 'A');
    input('departamento', 'TI');
    input('sueldo', '-1');
    submit();
    http.expectNone(url);
    expect(root.querySelector('#nombre')!.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('#cargo')!.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('#sueldo')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('elimina únicamente tras confirmar y actualiza tabla y selección después del éxito', async () => {
    await load();
    click('Editar');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    click('Eliminar');
    http.expectNone(`${url}/${employee.id}`);
    confirm.mockReturnValue(true);
    click('Eliminar');
    http.expectOne({ method: 'DELETE', url: `${url}/${employee.id}` }).flush(response({ id: employee.id }));
    await fixture.whenStable();
    expect(root.querySelector('tbody')!.textContent).toContain('No hay empleados');
    expect(root.querySelector<HTMLInputElement>('#nombre')!.value).toBe('');
  });

  it('preserva la fila si falla la eliminación', async () => {
    await load();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    click('Eliminar');
    http.expectOne(`${url}/${employee.id}`).flush({ message: 'Error al eliminar' }, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Torres');
    expect(root.querySelector('[role="alert"]')!.textContent).toContain('Error al eliminar');
  });

  it('permite volver a cargar después de un error de conexión', async () => {
    http.expectOne(url).error(new ProgressEvent('error'));
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')!.textContent).toContain('conectar');
    click('Actualizar');
    await load();
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(root.querySelector('tbody')!.textContent).toContain('Ana Torres');
  });

  it('actualiza las entradas del formulario al seleccionar otra fila', async () => {
    await load([employee, { ...employee, id: '507f1f77bcf86cd799439012', nombre: 'Luis Pérez' }]);
    click('Editar');
    input('nombre', 'Borrador anterior');
    const buttons = root.querySelectorAll<HTMLButtonElement>('button[aria-label^="Editar a"]');
    buttons[1].click();
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.directive(EmployeeFormComponent)).componentInstance as EmployeeFormComponent;
    expect(form.form.controls.nombre.value).toBe('Luis Pérez');
    expect(form.form.pristine).toBe(true);
  });
});

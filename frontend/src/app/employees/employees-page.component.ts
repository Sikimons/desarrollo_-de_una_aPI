import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { catchError, combineLatest, exhaustMap, map, Observable, of, startWith, Subject, tap } from 'rxjs';
import { Employee, EmployeeDraft } from './employee.model';
import { EmployeeService } from './employee.service';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeTableComponent } from './employee-table/employee-table.component';

type Command = { type: 'load' } | { type: 'save'; draft: EmployeeDraft; id?: string }
  | { type: 'remove'; id: string };
interface Operation { busy: boolean; error: string | null; message: string | null }

@Component({
  selector: 'app-employees-page',
  imports: [AsyncPipe, EmployeeFormComponent, EmployeeTableComponent],
  templateUrl: './employees-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesPageComponent {
  private readonly service = inject(EmployeeService);
  private readonly commands = new Subject<Command>();
  readonly selected = signal<Employee | null>(null);
  readonly formVersion = signal(0);

  // El async pipe es el único suscriptor. exhaustMap evita solicitudes simultáneas.
  private readonly operation$ = this.commands.pipe(
    startWith({ type: 'load' } as Command),
    exhaustMap((command) => this.execute(command).pipe(
      map((): Operation => ({
        busy: false,
        error: null,
        message: command.type === 'save' ? 'Empleado guardado correctamente.'
          : command.type === 'remove' ? 'Empleado eliminado correctamente.' : null,
      })),
      catchError((error: unknown) => of<Operation>({ busy: false, error: errorMessage(error), message: null })),
      startWith<Operation>({ busy: true, error: null, message: null }),
    )),
  );

  readonly vm$ = combineLatest({ employees: this.service.employees$, operation: this.operation$ });

  reload(): void { this.commands.next({ type: 'load' }); }

  edit(employee: Employee): void { this.selected.set(employee); }

  cancel(): void {
    this.selected.set(null);
    this.formVersion.update((version) => version + 1);
  }

  save(draft: EmployeeDraft): void {
    this.commands.next({ type: 'save', draft, id: this.selected()?.id });
  }

  remove(employee: Employee): void {
    if (window.confirm(`¿Eliminar a ${employee.nombre}?`)) {
      this.commands.next({ type: 'remove', id: employee.id });
    }
  }

  private execute(command: Command): Observable<unknown> {
    switch (command.type) {
      case 'load': return this.service.load();
      case 'save': return this.service.save(command.draft, command.id).pipe(tap(() => this.cancel()));
      case 'remove': return this.service.remove(command.id).pipe(tap(() => {
        if (this.selected()?.id === command.id) this.cancel();
      }));
    }
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Intenta nuevamente.';
    if (typeof error.error?.message === 'string') return error.error.message;
    return 'No se pudo completar la operación. Intenta nuevamente.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Employee, EmployeeDraft } from '../employee.model';

const textLength = (minimum: number): ValidatorFn => (control: AbstractControl) => {
  const length = String(control.value ?? '').trim().length;
  return length >= minimum && length <= 100 ? null : { textLength: true };
};
const positiveSalary: ValidatorFn = (control) =>
  typeof control.value === 'number' && Number.isFinite(control.value) && control.value > 0
    ? null : { positiveSalary: true };

@Component({
  selector: 'app-employee-form',
  imports: [ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent implements OnChanges {
  @Input() employee: Employee | null = null;
  @Input() resetVersion = 0;
  @Input() busy = false;
  @Output() readonly saved = new EventEmitter<EmployeeDraft>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [textLength(3)] }),
    cargo: new FormControl('', { nonNullable: true, validators: [textLength(2)] }),
    departamento: new FormControl('', { nonNullable: true, validators: [textLength(2)] }),
    sueldo: new FormControl<number | null>(null, [Validators.required, positiveSalary]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] || changes['resetVersion']) {
      // Copia explícita: el formulario nunca modifica el objeto recibido por @Input.
      const draft = this.employee ? { ...this.employee } : null;
      this.form.reset({
        nombre: draft?.nombre ?? '',
        cargo: draft?.cargo ?? '',
        departamento: draft?.departamento ?? '',
        sueldo: draft?.sueldo ?? null,
      });
    }
  }

  submit(): void {
    if (this.busy) return;
    this.form.markAllAsTouched();
    const draft = this.form.getRawValue();
    if (this.form.invalid || draft.sueldo === null) return;
    this.saved.emit({
      nombre: draft.nombre.trim(),
      cargo: draft.cargo.trim(),
      departamento: draft.departamento.trim(),
      sueldo: draft.sueldo,
    });
  }
}

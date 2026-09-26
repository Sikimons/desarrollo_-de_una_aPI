import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Employee } from '../employee.model';

@Component({
  selector: 'app-employee-table',
  imports: [CurrencyPipe],
  templateUrl: './employee-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeTableComponent {
  @Input({ required: true }) employees: readonly Employee[] = [];
  @Input() busy = false;
  @Output() readonly edited = new EventEmitter<Employee>();
  @Output() readonly removed = new EventEmitter<Employee>();
  @Output() readonly refreshed = new EventEmitter<void>();
}

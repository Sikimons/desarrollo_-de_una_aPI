import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ApiResponse, Employee, EmployeeDraft } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/v1/employees';
  private readonly employeesSubject = new BehaviorSubject<readonly Employee[]>([]);
  readonly employees$ = this.employeesSubject.asObservable();

  load() {
    return this.http.get<ApiResponse<Employee[]>>(this.url).pipe(
      map(unwrap),
      tap((employees) => this.employeesSubject.next([...employees])),
    );
  }

  save(draft: EmployeeDraft, id?: string) {
    const request = id
      ? this.http.put<ApiResponse<Employee>>(`${this.url}/${id}`, draft)
      : this.http.post<ApiResponse<Employee>>(this.url, draft);

    return request.pipe(
      map(unwrap),
      tap((saved) => {
        const current = this.employeesSubject.value;
        this.employeesSubject.next(id
          ? current.map((employee) => employee.id === id ? saved : employee)
          : [...current, saved]);
      }),
    );
  }

  remove(id: string) {
    return this.http.delete<ApiResponse<{ id: string }>>(`${this.url}/${id}`).pipe(
      map(unwrap),
      tap(() => this.employeesSubject.next(
        this.employeesSubject.value.filter((employee) => employee.id !== id),
      )),
    );
  }
}

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw new Error(response.message || 'La operación no pudo completarse.');
  }
  return response.data;
}

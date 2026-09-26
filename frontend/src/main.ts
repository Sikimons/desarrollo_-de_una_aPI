import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeEsEc from '@angular/common/locales/es-EC';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { EmployeesPageComponent } from './app/employees/employees-page.component';

registerLocaleData(localeEsEc);
bootstrapApplication(EmployeesPageComponent, {
  providers: [provideHttpClient(), { provide: LOCALE_ID, useValue: 'es-EC' }],
}).catch(console.error);

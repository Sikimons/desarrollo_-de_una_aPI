# Unidad 2: Arquitectura y Patrones de Diseño de APIs

Este repositorio contiene la infraestructura de software base (CRUD de Gestión de Personal) diseñada para la aplicación práctica de patrones empresariales en la **Maestría de Software**. 

El objetivo fundamental de este laboratorio es que el maestrante identifique, evalúe y erradique la **deuda técnica intencional** insertada en el código base, transformando un sistema acoplado y mutable en una arquitectura desacoplada, reactiva, blindada y eficiente bajo los atributos de calidad del estándar **ISO/IEC 25010**.

---

## 🏛️ El Desafío Académico: 4 Retos de Refactorización

Los estudiantes deberán tomar el código fuente inicial (el cual viola principios de diseño como responsabilidad única y encapsulamiento) y resolver incrementalmente los siguientes hitos de ingeniería:

### 📥 [Reto 1] Desacoplamiento del Backend y Persistencia Inversa
*   **Problema en la Base:** Los controladores de Express conocen e instancian directamente el modelo de Mongoose (`EmployeeModel`), acoplando la red con el motor de base de datos.
*   **Refactorización Exigida:** Implementar el **Patrón Repository** mediante una interfaz abstracta (`IEmployeeRepository`). La capa de Express debe ser agnóstica al ODM; si se remueve el `import mongoose` del controlador, el sistema debe seguir compilando perfectamente.

### 🛡️ [Reto 2] Validación Perimetral DTO y Respuesta Universal
*   **Problema en la Base:** No existe validación de tipos ni reglas de negocio en tiempo de ejecución. El servidor responde con payloads planos asimétricos y expone excepciones crudas del sistema en caso de fallos.
*   **Refactorización Exigida:** Construir esquemas declarativos con **Zod** (`employee.dto.ts`) para blindar `req.body` y `req.params`. Implementar el **Response Wrapper Pattern** y un middleware interceptor global de errores para unificar las salidas HTTP exitosas y fallidas.

### 📨 [Reto 3] Programación Reactiva e Inmutabilidad en el Servicio
*   **Problema en la Base:** El frontend de Angular almacena el estado en arreglos mutables locales dentro del componente de la vista y realiza peticiones directas mediante `HttpClient` en las funciones de interacción.
*   **Refactorización Exigida:** Aislar la lógica de consumo en un servicio reactivo (`EmployeeService`). Utilizar **RxJS** implementando `BehaviorSubject` privados y flujos exponenciales de solo lectura (`Observable$`) bajo el patrón de mutación de referencias inmutables (`[...current, new]`).

### 🎨 [Reto 4] Arquitectura de Componentes Smart vs. Dumb
*   **Problema en la Base:** El archivo HTML de la vista es un bloque monolítico masivo que mezcla el diseño de los formularios de captura con la rejilla de visualización de datos.
*   **Refactorización Exigida:** Fragmentar la UI. Crear un **Smart Component (Orquestador)** encargado de consumir los observables mediante el **`async` pipe** y delegar la renderización a **Dumb Components (Presentacionales)** independientes conectados exclusivamente por decoradores `@Input()` y `@Output()`.

---

## 🛠️ Requisitos e Instalación del Entorno (Node.js v24+)

Debido a cambios internos en las APIs globales de las versiones de Node.js modernas, este laboratorio descarta el uso del paquete obsoleto `ts-node-dev` y adopta **`tsx`** (impulsado por esbuild) para garantizar una ejecución veloz en caliente y compatibilidad total con módulos nativos de ECMAScript.

### Ejecución con Docker

Con Docker Engine y Docker Compose instalados, ejecuta desde la raíz del repositorio:

```bash
docker compose up --build
```

El backend quedará disponible en `http://localhost:3000` y su estado puede comprobarse en `http://localhost:3000/health`. MongoDB se ejecuta en la red interna de Compose y sus datos persisten en el volumen `mongo_data`.

Para cambiar el puerto publicado, copia `.env.example` como `.env` y modifica `BACKEND_PORT`. Para detener los servicios sin eliminar los datos:

```bash
docker compose down
```

### 1. Despliegue del Servidor (Backend)
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias de producción y desarrollo:
   ```bash
   npm install
   ```
3. Ejecuta el servidor en modo de desarrollo adaptativo (*Hot Reload watch*):
   ```bash
   npm run dev
   ```
   *El backend inicializará el compilador dinámico y escuchará peticiones en el puerto `3000`.*

### 2. Despliegue de la Interfaz (Frontend)
1. En una nueva terminal, navega al directorio del cliente:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del frontend (Angular 21, Node.js 24):
   ```bash
   npm install
   ```
3. Levanta el servidor local de desarrollo de Angular:
   ```bash
   npm start
   ```
   *La aplicación web estará disponible en `http://localhost:4200`.*

El servidor de desarrollo redirige `/api/**` a `http://localhost:3000` mediante
`frontend/proxy.conf.json`. Mantén el backend encendido; si cambias su puerto,
actualiza ese archivo. En producción, el servidor que publique los archivos de
`frontend/dist/employees/browser` debe redirigir `/api/**` al backend.

### Implementación del Reto 4

La carpeta `frontend` incorpora la interfaz Angular, ausente en el código base de
este repositorio. La vista se compone de tres componentes independientes:

| Componente | Responsabilidad | Comunicación |
| --- | --- | --- |
| `EmployeesPageComponent` (Smart) | Coordina carga, selección, guardado, eliminación y errores. Consume `vm$` una sola vez con `async`. | Consume `EmployeeService` y atiende los eventos de los hijos. |
| `EmployeeFormComponent` (Dumb) | Renderiza y valida el formulario sobre una copia de los datos. | `@Input`: `employee`, `resetVersion`, `busy`. `@Output`: `saved`, `cancelled`. |
| `EmployeeTableComponent` (Dumb) | Renderiza la tabla y sus acciones. | `@Input`: `employees`, `busy`. `@Output`: `edited`, `removed`, `refreshed`. |

Los componentes presentacionales usan `OnPush`, no conocen el servicio ni realizan
peticiones HTTP. Editar o cancelar no modifica las filas. El formulario se limpia
tras guardar correctamente; ante un error mantiene el borrador para reintentar.
`EmployeeService` concentra el CRUD, desenvuelve `ApiResponse.data` y expone un
`Observable` de solo lectura respaldado por un `BehaviorSubject` privado. Las
operaciones crean nuevas referencias con spread, `map` y `filter`.

No hay suscripciones manuales en los componentes: el `async` pipe gestiona el
ciclo de vida y `exhaustMap` evita operaciones simultáneas. Se emplean los
[decoradores de entrada soportados por Angular](https://angular.dev/guide/components/inputs)
y la [integración de HTTP con async](https://angular.dev/guide/http/making-requests).

Desde `frontend`, ejecuta `npm test` para comprobar la integración de formulario,
tabla y API simulada (incluidos cancelación, errores, reintentos e inmutabilidad),
y `npm run build` para compilar la aplicación con validación estricta de plantillas.
En PowerShell, usa `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

---

## 🧪 Validación de Contratos (Pruebas de Caja Negra)

Puedes verificar el comportamiento perimetral de tu servidor y la correcta intercepción de errores de Zod utilizando la extensión **REST Client** de VS Code. Ejecuta las siguientes peticiones sobre un archivo local de pruebas `api.rest`:

### Petición de Creación Exitosa (`POST`)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "Andrés Mendoza",
  "cargo": "Arquitecto de Software",
  "departamento": "Innovación",
  "sueldo": 4500
}
```

### Petición de Inyección Inválida (Activación del DTO)
```http
POST http://localhost:3000/api/v1/employees
Content-Type: application/json

{
  "nombre": "An",
  "cargo": "Developer",
  "departamento": "TI",
  "sueldo": -200
}
```
*Resultado Esperado: El servidor debe rechazar la petición con un estado `400 Bad Request` antes de tocar el controlador, devolviendo el JSON estructurado con la lista de campos inválidos.*

---

## 📊 Rúbrica de Evaluación Académica

La entrega final del laboratorio se evaluará bajo los siguientes criterios de calidad de código y diseño de sistemas:

*   **Acoplamiento Cero (25%):** El controlador no importa librerías ni dependencias de Mongoose. La conexión a base de datos está totalmente aislada.
*   **Gobernanza del Contrato (25%):** Uso correcto de validadores Zod. Presencia del Response Wrapper unificado tanto en éxitos como en excepciones del sistema.
*   **Flujo Reactivo Asíncrono (25%):** Inexistencia de suscripciones manuales (`.subscribe()`) en los componentes de Angular; uso obligatorio de patrones reactivos y `async` pipe.
*   **Separación de Vistas (25%):** Los componentes presentacionales son puros e inmutables. El formulario clona sus entradas para evitar mutaciones colaterales en la rejilla.

import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { EmployeeController } from './controllers/empleados.controllers.js';
import { MongoEmployeeRepository } from './repositories/mongo-employee.repository.js';

const port = Number(process.env.PORT ?? 3000);

await connectDatabase();

// Raíz de composición: es el único punto que conecta el puerto del dominio
// con el adaptador concreto de persistencia.
const employeeRepository = new MongoEmployeeRepository();
const employeeController = new EmployeeController(employeeRepository);
const app = createApp(employeeController);

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

import assert from 'node:assert/strict';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
};

const jsonRequest = (method, body) => ({
  method,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

let employeeId;

try {
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.success, true);
  assert.equal(health.body.data.status, 'ok');

  const invalidBody = await request(
    '/api/v1/empleados',
    jsonRequest('POST', {
      nombre: 'An',
      cargo: 'Developer',
      departamento: 'TI',
      sueldo: -200,
    }),
  );
  assert.equal(invalidBody.status, 400);
  assert.equal(invalidBody.body.success, false);
  assert.equal(invalidBody.body.data, null);
  assert.ok(
    invalidBody.body.errors.some((error) => error.field === 'body.nombre'),
  );
  assert.ok(
    invalidBody.body.errors.some((error) => error.field === 'body.sueldo'),
  );

  const invalidId = await request(
    '/api/v1/empleados/id-invalido',
    jsonRequest('PUT', { cargo: 'Developer' }),
  );
  assert.equal(invalidId.status, 400);
  assert.equal(invalidId.body.errors[0].field, 'params.id');

  const malformedJson = await request('/api/v1/empleados', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"nombre":',
  });
  assert.equal(malformedJson.status, 400);
  assert.equal(malformedJson.body.errors[0].code, 'invalid_json');

  const created = await request(
    '/api/v1/empleados',
    jsonRequest('POST', {
      nombre: 'Prueba Reto Dos',
      cargo: 'QA',
      departamento: 'TI',
      sueldo: 2800,
    }),
  );
  assert.equal(created.status, 201);
  assert.equal(created.body.success, true);
  employeeId = created.body.data.id;
  assert.ok(employeeId);

  const missingEmployee = await request(
    '/api/v1/empleados/000000000000000000000001',
    jsonRequest('PUT', { cargo: 'QA Senior' }),
  );
  assert.equal(missingEmployee.status, 404);
  assert.equal(missingEmployee.body.success, false);
  assert.equal(missingEmployee.body.data, null);

  const unknownRoute = await request('/api/v1/ruta-inexistente');
  assert.equal(unknownRoute.status, 404);
  assert.equal(unknownRoute.body.success, false);

  const deleted = await request(`/api/v1/empleados/${employeeId}`, {
    method: 'DELETE',
  });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.success, true);
  assert.equal(deleted.body.data.id, employeeId);
  employeeId = undefined;

  console.table([
    { case: 'Healthcheck con wrapper', status: health.status },
    { case: 'Body inválido', status: invalidBody.status },
    { case: 'ID inválido', status: invalidId.status },
    { case: 'JSON mal formado', status: malformedJson.status },
    { case: 'Creación válida', status: created.status },
    { case: 'Empleado inexistente', status: missingEmployee.status },
    { case: 'Ruta inexistente', status: unknownRoute.status },
    { case: 'Eliminación con wrapper', status: deleted.status },
  ]);
} finally {
  if (employeeId) {
    await request(`/api/v1/empleados/${employeeId}`, { method: 'DELETE' });
  }
}

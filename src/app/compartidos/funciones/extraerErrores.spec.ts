import { extraerErrores, extraerErroresIdentity } from './extraerErrores';

describe('extraerErrores (errores de validación de ASP.NET)', () => {
  it('convierte el diccionario errors en mensajes "campo: mensaje"', () => {
    const respuesta = { error: { errors: { Nombre: ['Es requerido'] } } };
    expect(extraerErrores(respuesta)).toEqual(['Nombre: Es requerido']);
  });

  it('aplana varios campos y varios mensajes por campo', () => {
    const respuesta = { error: { errors: { Nombre: ['Es requerido', 'Muy corto'], Fecha: ['Inválida'] } } };
    expect(extraerErrores(respuesta)).toEqual(['Nombre: Es requerido', 'Nombre: Muy corto', 'Fecha: Inválida']);
  });

  it('devuelve arreglo vacío cuando errors está vacío', () => {
    expect(extraerErrores({ error: { errors: {} } })).toEqual([]);
  });

  it('devuelve arreglo vacío cuando el cuerpo no trae la propiedad errors', () => {
    expect(extraerErrores({ error: {} })).toEqual([]);
  });

  it('lanza TypeError si la respuesta no trae cuerpo de error (p. ej. caída de red)', () => {
    expect(() => extraerErrores({})).toThrowError(TypeError);
  });
});

describe('extraerErroresIdentity (errores de ASP.NET Identity)', () => {
  it('extrae la description de cada error', () => {
    const respuesta = { error: [{ code: 'A', description: 'Password muy corto' }, { code: 'B', description: 'Falta mayúscula' }] };
    expect(extraerErroresIdentity(respuesta)).toEqual(['Password muy corto', 'Falta mayúscula']);
  });

  it('devuelve arreglo vacío cuando no hay errores', () => {
    expect(extraerErroresIdentity({ error: [] })).toEqual([]);
  });

  it('lanza TypeError si error es null (p. ej. caída de red, status 0)', () => {
    expect(() => extraerErroresIdentity({ error: null })).toThrowError(TypeError);
  });
});

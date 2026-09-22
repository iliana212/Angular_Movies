import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GenerosService } from './generos.service';
import { environment } from '../../environments/environment.development';

const URL = `${environment.apiURL}/generos`;
const GENEROS = [{ id: 1, nombre: 'Acción' }, { id: 2, nombre: 'Drama' }];

describe('GenerosService', () => {
  let servicio: GenerosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(GenerosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ---------- Casos normales ----------
  it('obtenerPaginado envía pagina y recordsPorPagina y devuelve la respuesta completa', () => {
    let respuesta: any;
    servicio.obtenerPaginado({ pagina: 1, recordsPorPagina: 5 }).subscribe(r => (respuesta = r));

    const req = http.expectOne(r => r.url === URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pagina')).toBe('1');
    expect(req.request.params.get('recordsPorPagina')).toBe('5');
    req.flush(GENEROS, { headers: { cantidadTotalRegistros: '2' } });

    expect(respuesta.body).toEqual(GENEROS);
    expect(respuesta.headers.get('cantidadTotalRegistros')).toBe('2');
  });

  it('obtenerTodos hace GET a /generos/todos', () => {
    let resultado: any;
    servicio.obtenerTodos().subscribe(r => (resultado = r));

    const req = http.expectOne(`${URL}/todos`);
    expect(req.request.method).toBe('GET');
    req.flush(GENEROS);

    expect(resultado).toEqual(GENEROS);
  });

  it('obtenerPorId hace GET a /generos/{id}', () => {
    servicio.obtenerPorId(1).subscribe();
    const req = http.expectOne(`${URL}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(GENEROS[0]);
  });

  it('crear envía POST con el nombre del género', () => {
    servicio.crear({ nombre: 'Terror' }).subscribe();
    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Terror' });
    req.flush(null);
  });

  it('actualizar envía PUT a /generos/{id}', () => {
    servicio.actualizar(2, { nombre: 'Comedia' }).subscribe();
    const req = http.expectOne(`${URL}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Comedia' });
    req.flush(null);
  });

  it('borrar envía DELETE a /generos/{id}', () => {
    servicio.borrar(2).subscribe();
    const req = http.expectOne(`${URL}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ---------- Casos límite ----------
  it('obtenerPaginado con página sin resultados devuelve arreglo vacío', () => {
    let respuesta: any;
    servicio.obtenerPaginado({ pagina: 99, recordsPorPagina: 5 }).subscribe(r => (respuesta = r));

    http.expectOne(r => r.url === URL).flush([], { headers: { cantidadTotalRegistros: '2' } });

    expect(respuesta.body).toEqual([]);
  });

  it('obtenerPaginado conserva un valor 0 en los parámetros', () => {
    servicio.obtenerPaginado({ pagina: 0, recordsPorPagina: 0 }).subscribe();
    const req = http.expectOne(r => r.url === URL);
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('recordsPorPagina')).toBe('0');
    req.flush([]);
  });

  // ---------- Escenarios de falla ----------
  it('obtenerPorId propaga el 404 cuando el género no existe', () => {
    let error: any;
    servicio.obtenerPorId(404).subscribe({ error: e => (error = e) });
    http.expectOne(`${URL}/404`).flush('No existe', { status: 404, statusText: 'Not Found' });
    expect(error.status).toBe(404);
  });

  it('crear propaga los errores de validación 400', () => {
    let error: any;
    servicio.crear({ nombre: '' }).subscribe({ error: e => (error = e) });
    http.expectOne(URL).flush(
      { errors: { Nombre: ['El campo Nombre es requerido'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    expect(error.status).toBe(400);
    expect(error.error.errors.Nombre.length).toBe(1);
  });

  it('borrar propaga 403 cuando el usuario no es administrador', () => {
    let error: any;
    servicio.borrar(1).subscribe({ error: e => (error = e) });
    http.expectOne(`${URL}/1`).flush(null, { status: 403, statusText: 'Forbidden' });
    expect(error.status).toBe(403);
  });

  it('obtenerTodos maneja una caída de red (status 0)', () => {
    let error: any;
    servicio.obtenerTodos().subscribe({ error: e => (error = e) });
    http.expectOne(`${URL}/todos`).error(new ProgressEvent('error'));
    expect(error.status).toBe(0);
  });
});

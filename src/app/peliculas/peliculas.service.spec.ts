import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PeliculasService } from './peliculas.service';
import { PeliculaCreacionDTO } from './peliculas';
import { environment } from '../../environments/environment.development';

// ---------- Fixtures ----------
const URL = `${environment.apiURL}/peliculas`;

const PELICULA: any = {
  id: 5,
  titulo: 'Interestelar',
  fechaLanzamiento: '2014-11-07',
  trailer: 'https://youtu.be/xyz',
  votoUsuario: 0,
  promedioVoto: 4.5,
};
const LANDING = { enCines: [PELICULA], proximosEstrenos: [] };

// Fecha al mediodía UTC para que la prueba no dependa de la zona horaria de quien la ejecuta.
function crearDTO(cambios: Partial<PeliculaCreacionDTO> = {}): PeliculaCreacionDTO {
  return {
    titulo: 'Dune',
    fechaLanzamiento: new Date('2021-10-22T12:00:00Z'),
    trailer: 'https://youtu.be/dune',
    poster: new File(['x'], 'dune.jpg', { type: 'image/jpeg' }),
    generosIds: [1, 2],
    cinesIds: [3],
    actores: [{ id: 9, nombre: 'Timothée', personaje: 'Paul', foto: '' }] as any,
    ...cambios,
  };
}

describe('PeliculasService', () => {
  let servicio: PeliculasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(PeliculasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ---------- Casos normales ----------
  it('obtenerLandingPage hace GET a /peliculas/landing y devuelve el modelo', () => {
    let resultado: any;
    servicio.obtenerLandingPage().subscribe(r => (resultado = r));

    const req = http.expectOne(`${URL}/landing`);
    expect(req.request.method).toBe('GET');
    req.flush(LANDING);

    expect(resultado).toEqual(LANDING);
  });

  it('obtenerPorId hace GET a /peliculas/{id}', () => {
    let resultado: any;
    servicio.obtenerPorId(5).subscribe(r => (resultado = r));

    const req = http.expectOne(`${URL}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(PELICULA);

    expect(resultado.titulo).toBe('Interestelar');
  });

  it('filtrar envía filtros y paginación como query string y devuelve la respuesta completa', () => {
    servicio.filtrar({ titulo: 'dun', generoId: 2, enCines: true, proximosEstrenos: false, pagina: 2, recordsPorPagina: 10 }).subscribe();

    const req = http.expectOne(r => r.url === `${URL}/filtrar`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('titulo')).toBe('dun');
    expect(req.request.params.get('generoId')).toBe('2');
    expect(req.request.params.get('enCines')).toBe('true');
    expect(req.request.params.get('proximosEstrenos')).toBe('false');
    expect(req.request.params.get('pagina')).toBe('2');
    expect(req.request.params.get('recordsPorPagina')).toBe('10');
    req.flush([PELICULA]);
  });

  it('crearGet hace GET a /peliculas/postget', () => {
    servicio.crearGet().subscribe();
    const req = http.expectOne(`${URL}/postget`);
    expect(req.request.method).toBe('GET');
    req.flush({ generos: [], cines: [] });
  });

  it('actualizarGet hace GET a /peliculas/putget/{id}', () => {
    servicio.actualizarGet(5).subscribe();
    const req = http.expectOne(`${URL}/putget/5`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('crear envía POST con FormData completo (título, fecha yyyy-MM-dd, póster, trailer y listas en JSON)', () => {
    const dto = crearDTO();
    servicio.crear(dto).subscribe();

    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    const body = req.request.body as FormData;
    expect(body instanceof FormData).toBeTrue();
    expect(body.get('titulo')).toBe('Dune');
    expect(body.get('fechaLanzamiento')).toBe('2021-10-22');
    expect(body.get('poster') instanceof File).toBeTrue();
    expect(body.get('trailer')).toBe('https://youtu.be/dune');
    expect(body.get('generosIds')).toBe('[1,2]');
    expect(body.get('cinesIds')).toBe('[3]');
    expect(JSON.parse(body.get('actores') as string)).toEqual(dto.actores as any);
    req.flush(PELICULA);
  });

  it('actualizar envía PUT a /peliculas/{id} con FormData', () => {
    servicio.actualizar(5, crearDTO()).subscribe();

    const req = http.expectOne(`${URL}/5`);
    expect(req.request.method).toBe('PUT');
    expect((req.request.body as FormData).get('titulo')).toBe('Dune');
    req.flush(null);
  });

  it('borrar envía DELETE a /peliculas/{id}', () => {
    servicio.borrar(5).subscribe();
    const req = http.expectOne(`${URL}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ---------- Casos límite ----------
  it('filtrar expone el total de registros de la cabecera cantidadTotalRegistros', () => {
    let respuesta: any;
    servicio.filtrar({ pagina: 1, recordsPorPagina: 10 }).subscribe(r => (respuesta = r));

    http.expectOne(r => r.url === `${URL}/filtrar`)
      .flush([PELICULA], { headers: { cantidadTotalRegistros: '37' } });

    expect(respuesta.headers.get('cantidadTotalRegistros')).toBe('37');
  });

  it('filtrar devuelve un arreglo vacío cuando no hay coincidencias', () => {
    let respuesta: any;
    servicio.filtrar({ titulo: 'zzz', pagina: 1, recordsPorPagina: 10 }).subscribe(r => (respuesta = r));

    http.expectOne(r => r.url === `${URL}/filtrar`)
      .flush([], { headers: { cantidadTotalRegistros: '0' } });

    expect(respuesta.body).toEqual([]);
  });

  it('crear sin póster ni trailer no adjunta esos campos al FormData', () => {
    servicio.crear(crearDTO({ poster: undefined, trailer: '' })).subscribe();

    const body = http.expectOne(URL).request.body as FormData;
    expect(body.has('poster')).toBeFalse();
    expect(body.has('trailer')).toBeFalse();
  });

  it('crear con listas vacías las serializa como "[]"', () => {
    servicio.crear(crearDTO({ generosIds: [], cinesIds: [], actores: [] })).subscribe();

    const body = http.expectOne(URL).request.body as FormData;
    expect(body.get('generosIds')).toBe('[]');
    expect(body.get('cinesIds')).toBe('[]');
    expect(body.get('actores')).toBe('[]');
  });

  it('crear con título de un solo carácter lo envía sin recortarlo', () => {
    servicio.crear(crearDTO({ titulo: 'M' })).subscribe();
    expect((http.expectOne(URL).request.body as FormData).get('titulo')).toBe('M');
  });

  // ---------- Escenarios de falla ----------
  it('crear lanza RangeError si la fecha de lanzamiento es inválida (no envía petición)', () => {
    expect(() => servicio.crear(crearDTO({ fechaLanzamiento: new Date('basura') }))).toThrowError(RangeError);
    http.expectNone(URL);
  });

  it('obtenerPorId propaga el 404 cuando la película no existe', () => {
    let error: any;
    servicio.obtenerPorId(999).subscribe({ error: e => (error = e) });

    http.expectOne(`${URL}/999`).flush('No encontrada', { status: 404, statusText: 'Not Found' });

    expect(error.status).toBe(404);
  });

  it('crear propaga los errores de validación 400 del backend', () => {
    let error: any;
    servicio.crear(crearDTO({ titulo: '' })).subscribe({ error: e => (error = e) });

    http.expectOne(URL).flush(
      { errors: { titulo: ['El título es requerido'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(error.status).toBe(400);
    expect(error.error.errors.titulo[0]).toContain('requerido');
  });

  it('borrar propaga 401 cuando el usuario no está autenticado', () => {
    let error: any;
    servicio.borrar(5).subscribe({ error: e => (error = e) });

    http.expectOne(`${URL}/5`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(error.status).toBe(401);
  });

  it('obtenerLandingPage propaga el error 500 del servidor', () => {
    let error: any;
    servicio.obtenerLandingPage().subscribe({ error: e => (error = e) });

    http.expectOne(`${URL}/landing`).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(error.status).toBe(500);
  });
});

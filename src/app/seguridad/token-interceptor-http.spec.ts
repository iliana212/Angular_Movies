// PRUEBA DE INTEGRACIÓN: HttpClient real + authInterceptor real + SeguridadService real.
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './token-interceptor-http';

const URL_API = 'https://api.test/peliculas/landing';
const TOKEN = 'header.payload.firma';

describe('Integración: authInterceptor + HttpClient + SeguridadService', () => {
  let cliente: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    cliente = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('agrega "Authorization: Bearer <token>" cuando hay token guardado', () => {
    localStorage.setItem('token', TOKEN);

    cliente.get(URL_API).subscribe();

    const req = http.expectOne(URL_API);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    req.flush({});
  });

  it('agrega el header también en peticiones POST y conserva los headers existentes', () => {
    localStorage.setItem('token', TOKEN);

    cliente.post(URL_API, {}, { headers: { 'X-Test': '1' } }).subscribe();

    const req = http.expectOne(URL_API);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    expect(req.request.headers.get('X-Test')).toBe('1');
    req.flush({});
  });

  it('NO agrega Authorization cuando no hay token', () => {
    cliente.get(URL_API).subscribe();

    const req = http.expectOne(URL_API);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('lee el token en cada petición (refleja login y logout entre llamadas)', () => {
    cliente.get(URL_API).subscribe();
    expect(http.expectOne(URL_API).request.headers.has('Authorization')).toBeFalse();

    localStorage.setItem('token', TOKEN);
    cliente.get(URL_API).subscribe();
    expect(http.expectOne(URL_API).request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);

    localStorage.removeItem('token');
    cliente.get(URL_API).subscribe();
    expect(http.expectOne(URL_API).request.headers.has('Authorization')).toBeFalse();
  });

  it('deja pasar el error 401 al suscriptor sin ocultarlo', () => {
    localStorage.setItem('token', TOKEN);
    let error: any;

    cliente.get(URL_API).subscribe({ error: e => (error = e) });
    http.expectOne(URL_API).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(error.status).toBe(401);
  });
});

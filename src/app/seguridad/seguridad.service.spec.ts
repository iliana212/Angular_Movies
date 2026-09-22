import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SeguridadService } from './seguridad.service';
import { environment } from '../../environments/environment.development';

// ---------- Fixtures ----------
const LLAVE_TOKEN = 'token';
const LLAVE_EXPIRACION = 'token-expiracion';
const URL_USUARIOS = `${environment.apiURL}/usuarios`;
const CREDENCIALES = { email: 'ana@test.com', password: 'Passw0rd!' };

/** JWT de prueba con payload en base64url (el formato real de los JWT). */
function crearJWT(payload: Record<string, unknown>): string {
  const b64url = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.firma-falsa`;
}
const enUnaHora = () => new Date(Date.now() + 3_600_000).toISOString();
const haceUnaHora = () => new Date(Date.now() - 3_600_000).toISOString();

describe('SeguridadService', () => {
  let servicio: SeguridadService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(SeguridadService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  // ---------- Casos normales ----------
  describe('login y registrar', () => {
    it('login envía POST a /usuarios/login y guarda token y expiración', () => {
      const token = crearJWT({ email: CREDENCIALES.email });
      const expiracion = enUnaHora();

      servicio.login(CREDENCIALES).subscribe();

      const req = http.expectOne(`${URL_USUARIOS}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(CREDENCIALES);
      req.flush({ token, expiracion });

      expect(localStorage.getItem(LLAVE_TOKEN)).toBe(token);
      expect(localStorage.getItem(LLAVE_EXPIRACION)).toBe(expiracion);
    });

    it('registrar envía POST a /usuarios/registrar y guarda el token (sesión inmediata)', () => {
      const token = crearJWT({ email: CREDENCIALES.email });

      servicio.registrar(CREDENCIALES).subscribe();

      const req = http.expectOne(`${URL_USUARIOS}/registrar`);
      expect(req.request.method).toBe('POST');
      req.flush({ token, expiracion: enUnaHora() });

      expect(servicio.obtenerToken()).toBe(token);
    });
  });

  describe('estaLogueado', () => {
    it('devuelve true con token vigente', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, enUnaHora());
      expect(servicio.estaLogueado()).toBeTrue();
    });
  });

  describe('obtenerCampoJWT / obtenerRol / obtenerToken', () => {
    it('obtenerCampoJWT lee un claim del payload', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({ email: 'ana@test.com' }));
      expect(servicio.obtenerCampoJWT('email')).toBe('ana@test.com');
    });

    it('obtenerRol devuelve "admin" cuando el token trae el claim esadmin', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({ esadmin: 'true' }));
      expect(servicio.obtenerRol()).toBe('admin');
    });

    it('obtenerToken devuelve el token almacenado', () => {
      localStorage.setItem(LLAVE_TOKEN, 'abc');
      expect(servicio.obtenerToken()).toBe('abc');
    });
  });

  describe('administración de usuarios', () => {
    it('hacerAdmin envía POST con el email a /usuarios/HacerAdmin', () => {
      servicio.hacerAdmin('ana@test.com').subscribe();
      const req = http.expectOne(`${URL_USUARIOS}/HacerAdmin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'ana@test.com' });
      req.flush(null);
    });

    it('removerAdmin envía POST con el email a /usuarios/RemoverAdmin', () => {
      servicio.removerAdmin('ana@test.com').subscribe();
      const req = http.expectOne(`${URL_USUARIOS}/RemoverAdmin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'ana@test.com' });
      req.flush(null);
    });

    it('obtenerUsuariosPaginado envía la paginación y expone el total en la cabecera', () => {
      let respuesta: any;
      servicio.obtenerUsuariosPaginado({ pagina: 2, recordsPorPagina: 5 }).subscribe(r => (respuesta = r));

      const req = http.expectOne(r => r.url === `${URL_USUARIOS}/ListadoUsuarios`);
      expect(req.request.params.get('pagina')).toBe('2');
      expect(req.request.params.get('recordsPorPagina')).toBe('5');
      req.flush([{ email: 'a@b.com' }], { headers: { cantidadTotalRegistros: '11' } });

      expect(respuesta.headers.get('cantidadTotalRegistros')).toBe('11');
      expect(respuesta.body.length).toBe(1);
    });
  });

  describe('logout', () => {
    it('elimina token y expiración del almacenamiento', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, enUnaHora());

      servicio.logout();

      expect(localStorage.getItem(LLAVE_TOKEN)).toBeNull();
      expect(localStorage.getItem(LLAVE_EXPIRACION)).toBeNull();
      expect(servicio.estaLogueado()).toBeFalse();
    });
  });

  // ---------- Casos límite ----------
  describe('límites', () => {
    it('estaLogueado devuelve false sin token', () => {
      expect(servicio.estaLogueado()).toBeFalse();
    });

    it('estaLogueado devuelve false y limpia el storage si la expiración ya pasó', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, haceUnaHora());

      expect(servicio.estaLogueado()).toBeFalse();
      expect(localStorage.getItem(LLAVE_TOKEN)).toBeNull();
    });

    it('estaLogueado devuelve true cuando el token expira en unos segundos (aún vigente)', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, new Date(Date.now() + 5_000).toISOString());

      expect(servicio.estaLogueado()).toBeTrue();
    });

    it('estaLogueado devuelve false cuando el token expiró hace unos segundos', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, new Date(Date.now() - 5_000).toISOString());

      expect(servicio.estaLogueado()).toBeFalse();
    });

    it('estaLogueado devuelve false si hay token pero falta la llave de expiración', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      expect(servicio.estaLogueado()).toBeFalse();
    });

    it('obtenerCampoJWT devuelve cadena vacía si no hay token', () => {
      expect(servicio.obtenerCampoJWT('email')).toBe('');
    });

    it('obtenerCampoJWT devuelve undefined cuando el claim no existe (comportamiento actual)', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({ email: 'a@b.com' }));
      expect(servicio.obtenerCampoJWT('inexistente')).toBeUndefined();
    });

    it('obtenerRol devuelve cadena vacía sin claim esadmin', () => {
      localStorage.setItem(LLAVE_TOKEN, crearJWT({ email: 'a@b.com' }));
      expect(servicio.obtenerRol()).toBe('');
    });

    it('obtenerRol devuelve cadena vacía sin token', () => {
      expect(servicio.obtenerRol()).toBe('');
    });

    it('obtenerToken devuelve null sin sesión', () => {
      expect(servicio.obtenerToken()).toBeNull();
    });
  });

  // ---------- Escenarios de falla ----------
  describe('fallas', () => {
    it('login propaga el error 400 y NO guarda token', () => {
      let error: any;
      servicio.login(CREDENCIALES).subscribe({ error: e => (error = e) });

      http.expectOne(`${URL_USUARIOS}/login`)
        .flush([{ description: 'Login incorrecto' }], { status: 400, statusText: 'Bad Request' });

      expect(error.status).toBe(400);
      expect(localStorage.getItem(LLAVE_TOKEN)).toBeNull();
    });

    it('login propaga el error 500 del servidor', () => {
      let error: any;
      servicio.login(CREDENCIALES).subscribe({ error: e => (error = e) });

      http.expectOne(`${URL_USUARIOS}/login`).flush('boom', { status: 500, statusText: 'Server Error' });

      expect(error.status).toBe(500);
      expect(localStorage.getItem(LLAVE_TOKEN)).toBeNull();
    });

    it('login maneja una caída de red (status 0) sin guardar token', () => {
      let error: any;
      servicio.login(CREDENCIALES).subscribe({ error: e => (error = e) });

      http.expectOne(`${URL_USUARIOS}/login`).error(new ProgressEvent('error'));

      expect(error.status).toBe(0);
      expect(localStorage.getItem(LLAVE_TOKEN)).toBeNull();
    });

    it('registrar propaga el error 400 (correo ya registrado) y NO guarda token', () => {
      let error: any;
      servicio.registrar(CREDENCIALES).subscribe({ error: e => (error = e) });

      http.expectOne(`${URL_USUARIOS}/registrar`)
        .flush([{ description: 'Email duplicado' }], { status: 400, statusText: 'Bad Request' });

      expect(error.status).toBe(400);
      expect(servicio.obtenerToken()).toBeNull();
    });
  });

  // ---------- Defectos detectados (fallan hasta corregir el código) ----------
  describe('DEFECTOS detectados en seguridad.service.ts', () => {
    it('[BUG] estaLogueado debe devolver false si la expiración no es una fecha válida', () => {
      // Hoy: new Date('basura') es "Invalid Date" y (Invalid <= ahora) es false => devuelve true.
      localStorage.setItem(LLAVE_TOKEN, crearJWT({}));
      localStorage.setItem(LLAVE_EXPIRACION, 'no-es-una-fecha');
      expect(servicio.estaLogueado()).toBeFalse();
    });

    it('[BUG] obtenerCampoJWT debe decodificar un JWT cuyo payload contiene "-" o "_" (base64url)', () => {
      // Hoy: atob() no acepta base64url y lanza InvalidCharacterError con estos payloads.
      localStorage.setItem(LLAVE_TOKEN, crearJWT({ x: '???>>>' }));
      expect(servicio.obtenerCampoJWT('x')).toBe('???>>>');
    });

    it('[BUG] obtenerCampoJWT no debe lanzar excepción con un token malformado', () => {
      // Hoy: JSON.parse/atob lanzan y, vía obtenerRol, romperían el guard de rutas.
      localStorage.setItem(LLAVE_TOKEN, 'esto.no.es-jwt');
      expect(() => servicio.obtenerCampoJWT('email')).not.toThrow();
      expect(servicio.obtenerCampoJWT('email')).toBe('');
    });
  });
});

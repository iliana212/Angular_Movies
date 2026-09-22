// PRUEBA DE INTEGRACIÓN: LoginComponent + FormularioAutenticacionComponent reales;
// solo se simulan SeguridadService (HTTP) y el Router.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';
import { SeguridadService } from '../seguridad.service';

describe('LoginComponent (integración con el formulario)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let componente: LoginComponent;
  let seguridad: jasmine.SpyObj<SeguridadService>;
  let router: { navigate: jasmine.Spy };

  const el = () => fixture.nativeElement as HTMLElement;
  const CREDENCIALES = { email: 'ana@test.com', password: 'Passw0rd!' };

  function escribir(selector: string, valor: string) {
    const input = el().querySelector(selector) as HTMLInputElement;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }

  beforeEach(async () => {
    seguridad = jasmine.createSpyObj('SeguridadService', ['login']);
    router = { navigate: jasmine.createSpy('navigate') };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: SeguridadService, useValue: seguridad },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------- Casos normales ----------
  it('loguear con éxito llama a login y navega a "/"', () => {
    seguridad.login.and.returnValue(of({ token: 't', expiracion: new Date() }));

    componente.loguear(CREDENCIALES);

    expect(seguridad.login).toHaveBeenCalledOnceWith(CREDENCIALES);
    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
    expect(componente.errores).toEqual([]);
  });

  it('flujo completo: al llenar el formulario y enviarlo se llama a login con esas credenciales', () => {
    seguridad.login.and.returnValue(of({ token: 't', expiracion: new Date() }));

    escribir('input[type="text"], input:not([type])', CREDENCIALES.email);
    escribir('input[type="password"]', CREDENCIALES.password);
    fixture.detectChanges();
    el().querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(seguridad.login).toHaveBeenCalledOnceWith(CREDENCIALES);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  // ---------- Escenarios de falla ----------
  it('con error de credenciales (400) muestra las descripciones de Identity y no navega', () => {
    seguridad.login.and.returnValue(
      throwError(() => ({ status: 400, error: [{ code: 'X', description: 'Login incorrecto' }] })),
    );

    componente.loguear(CREDENCIALES);
    fixture.changeDetectorRef.markForCheck(); // errores es una propiedad simple: se marca la vista para re-renderizar
    fixture.detectChanges();

    expect(componente.errores).toEqual(['Login incorrecto']);
    expect(router.navigate).not.toHaveBeenCalled();
    expect(el().querySelector('li')!.textContent).toContain('Login incorrecto');
  });

  it('acumula varios errores de Identity en la lista mostrada', () => {
    seguridad.login.and.returnValue(
      throwError(() => ({ error: [{ description: 'Error 1' }, { description: 'Error 2' }] })),
    );

    componente.loguear(CREDENCIALES);
    fixture.changeDetectorRef.markForCheck(); // errores es una propiedad simple: se marca la vista para re-renderizar
    fixture.detectChanges();

    expect(el().querySelectorAll('li').length).toBe(2);
  });

  // ---------- Casos límite ----------
  it('no llama a login si el formulario está vacío', () => {
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    expect(seguridad.login).not.toHaveBeenCalled();
  });
});

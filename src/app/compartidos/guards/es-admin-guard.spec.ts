import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { esAdminGuard } from './es-admin-guard';
import { SeguridadService } from '../../seguridad/seguridad.service';

describe('esAdminGuard', () => {
  let seguridad: jasmine.SpyObj<SeguridadService>;
  let router: { navigate: jasmine.Spy };

  const ejecutarGuard = () =>
    TestBed.runInInjectionContext(() => esAdminGuard({} as any, {} as any));

  beforeEach(() => {
    seguridad = jasmine.createSpyObj('SeguridadService', ['obtenerRol']);
    router = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        { provide: SeguridadService, useValue: seguridad },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('permite el acceso y no redirige cuando el rol es admin', () => {
    seguridad.obtenerRol.and.returnValue('admin');

    expect(ejecutarGuard()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirige a /login cuando el usuario no es admin', () => {
    seguridad.obtenerRol.and.returnValue('');

    ejecutarGuard();

    expect(router.navigate).toHaveBeenCalledOnceWith(['/login']);
  });

  it('[BUG] debe BLOQUEAR el acceso (false) cuando el usuario no es admin', () => {
    // Hoy el guard redirige pero devuelve true, por lo que la ruta protegida igualmente se activa.
    seguridad.obtenerRol.and.returnValue('');

    expect(ejecutarGuard()).toBeFalse();
  });
});

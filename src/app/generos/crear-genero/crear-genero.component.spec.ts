// PRUEBA DE INTEGRACIÓN: CrearGeneroComponent + FormularioGeneroComponent reales;
// solo se simula GenerosService (HTTP). El Router real se espía.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CrearGeneroComponent } from './crear-genero.component';
import { GenerosService } from '../generos.service';

describe('CrearGeneroComponent (integración con el formulario)', () => {
  let fixture: ComponentFixture<CrearGeneroComponent>;
  let generos: jasmine.SpyObj<GenerosService>;
  let router: Router;

  const el = () => fixture.nativeElement as HTMLElement;

  function enviarNombre(nombre: string) {
    const input = el().querySelector('input') as HTMLInputElement;
    input.value = nombre;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    el().querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    generos = jasmine.createSpyObj('GenerosService', ['crear']);
    await TestBed.configureTestingModule({
      imports: [CrearGeneroComponent],
      providers: [provideRouter([]), { provide: GenerosService, useValue: generos }],
    }).compileComponents();
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(CrearGeneroComponent);
    fixture.detectChanges();
  });

  // ---------- Casos normales ----------
  it('al enviar un nombre válido crea el género y navega a /generos', () => {
    generos.crear.and.returnValue(of({}));

    enviarNombre('Drama');

    expect(generos.crear).toHaveBeenCalledOnceWith({ nombre: 'Drama' });
    expect(router.navigate).toHaveBeenCalledOnceWith(['/generos']);
  });

  // ---------- Casos límite ----------
  it('no muestra errores al cargar el componente', () => {
    expect(el().querySelectorAll('li').length).toBe(0);
  });

  // ---------- Escenarios de falla ----------
  it('con nombre inválido (minúscula) no llama al servicio ni navega', () => {
    enviarNombre('drama');

    expect(generos.crear).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('con error 400 del backend muestra los mensajes "campo: mensaje" y no navega', () => {
    generos.crear.and.returnValue(
      throwError(() => ({ status: 400, error: { errors: { Nombre: ['Ya existe un género con ese nombre'] } } })),
    );

    enviarNombre('Drama');

    expect(router.navigate).not.toHaveBeenCalled();
    expect(el().querySelector('li')!.textContent).toContain('Nombre: Ya existe un género con ese nombre');
  });
});

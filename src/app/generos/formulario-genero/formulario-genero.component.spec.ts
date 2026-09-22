import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormularioGeneroComponent } from './formulario-genero.component';

describe('FormularioGeneroComponent', () => {
  let fixture: ComponentFixture<FormularioGeneroComponent>;
  let componente: FormularioGeneroComponent;
  let emitido: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioGeneroComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioGeneroComponent);
    componente = fixture.componentInstance;
    emitido = jasmine.createSpy('posteoFormulario');
    componente.posteoFormulario.subscribe(emitido);
  });

  // ---------- Casos normales ----------
  it('emite el género cuando el nombre es válido', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'Drama' });

    componente.guardarCambios();

    expect(emitido).toHaveBeenCalledOnceWith({ nombre: 'Drama' });
  });

  it('en modo edición precarga el formulario con el modelo recibido', () => {
    fixture.componentRef.setInput('modelo', { id: 3, nombre: 'Acción' });
    fixture.detectChanges();

    expect(componente.form.value.nombre).toBe('Acción');
  });

  it('sin modelo (modo creación) el formulario inicia vacío', () => {
    fixture.detectChanges();
    expect(componente.form.value.nombre).toBe('');
  });

  // ---------- Casos límite ----------
  it('acepta un nombre de exactamente 50 caracteres', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'A'.repeat(50) });
    expect(componente.form.valid).toBeTrue();
  });

  it('rechaza un nombre de 51 caracteres con el mensaje de longitud máxima', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'A'.repeat(51) });

    expect(componente.form.valid).toBeFalse();
    expect(componente.obtenerErrorCampoNombre()).toBe('El campo Nombre no puede tener más de 50 caracteres');
  });

  it('acepta un nombre de un solo carácter en mayúscula', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'Z' });
    expect(componente.form.valid).toBeTrue();
  });

  it('devuelve cadena vacía como mensaje de error cuando el nombre es válido', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'Comedia' });
    expect(componente.obtenerErrorCampoNombre()).toBe('');
  });

  // ---------- Escenarios de falla ----------
  it('NO emite y muestra "obligatorio" cuando el nombre está vacío', () => {
    fixture.detectChanges();

    componente.guardarCambios();

    expect(emitido).not.toHaveBeenCalled();
    expect(componente.obtenerErrorCampoNombre()).toBe('El campo Nombre es obligatorio');
  });

  it('NO emite y muestra el mensaje cuando la primera letra es minúscula', () => {
    fixture.detectChanges();
    componente.form.setValue({ nombre: 'drama' });

    componente.guardarCambios();

    expect(emitido).not.toHaveBeenCalled();
    expect(componente.obtenerErrorCampoNombre()).toBe('La primera letra debe ser mayúscula');
  });

  it('el botón Guardar está deshabilitado con el formulario inválido', () => {
    fixture.detectChanges();
    const boton = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(boton.disabled).toBeTrue();
  });
});

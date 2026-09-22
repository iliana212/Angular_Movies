import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAutenticacionComponent } from './formulario-autenticacion';

describe('FormularioAutenticacionComponent', () => {
  let fixture: ComponentFixture<FormularioAutenticacionComponent>;
  let componente: FormularioAutenticacionComponent;
  let emitido: jasmine.Spy;

  const el = () => fixture.nativeElement as HTMLElement;
  const botonEnviar = () => el().querySelector('button[type="submit"]') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormularioAutenticacionComponent] }).compileComponents();
    fixture = TestBed.createComponent(FormularioAutenticacionComponent);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Login');
    emitido = jasmine.createSpy('posteoFormulario');
    componente.posteoFormulario.subscribe(emitido);
    fixture.detectChanges();
  });

  // ---------- Casos normales ----------
  it('muestra el título recibido', () => {
    expect(el().querySelector('h2')!.textContent).toContain('Login');
  });

  it('emite las credenciales cuando el formulario es válido', () => {
    componente.form.setValue({ email: 'ana@test.com', password: 'Passw0rd!' });

    componente.guardarCambios();

    expect(emitido).toHaveBeenCalledOnceWith({ email: 'ana@test.com', password: 'Passw0rd!' });
  });

  it('muestra los errores del servidor recibidos por @Input', () => {
    fixture.componentRef.setInput('errores', ['Login incorrecto']);
    fixture.detectChanges();
    expect(el().querySelector('li')!.textContent).toContain('Login incorrecto');
  });

  it('el botón Enviar se habilita con datos válidos y el submit del <form> emite', () => {
    componente.form.setValue({ email: 'ana@test.com', password: 'x' });
    fixture.detectChanges();

    expect(botonEnviar().disabled).toBeFalse();
    el().querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(emitido).toHaveBeenCalledTimes(1);
  });

  // ---------- Casos límite ----------
  it('el formulario nace inválido y con el botón Enviar deshabilitado', () => {
    expect(componente.form.valid).toBeFalse();
    expect(botonEnviar().disabled).toBeTrue();
  });

  it('mensaje de email: obligatorio cuando está vacío', () => {
    componente.form.controls.email.setValue('');
    expect(componente.obtenerMensajeErrorEmail()).toBe('El campo Email es obligatorio');
  });

  it('mensaje de email: no válido cuando no tiene formato de correo', () => {
    componente.form.controls.email.setValue('sin-arroba');
    expect(componente.obtenerMensajeErrorEmail()).toBe('El campo Email no es válido');
  });

  it('mensaje de email: vacío cuando el correo es válido', () => {
    componente.form.controls.email.setValue('ana@test.com');
    expect(componente.obtenerMensajeErrorEmail()).toBe('');
  });

  it('mensaje de password: obligatorio cuando está vacío y vacío cuando tiene valor', () => {
    expect(componente.obtenerMensajeErrorPassword()).toBe('El campo Password es obligatorio');
    componente.form.controls.password.setValue('x');
    expect(componente.obtenerMensajeErrorPassword()).toBe('');
  });

  // ---------- Escenarios de falla ----------
  it('NO emite si el formulario está vacío', () => {
    componente.guardarCambios();
    expect(emitido).not.toHaveBeenCalled();
  });

  it('NO emite si el email es inválido aunque el password exista', () => {
    componente.form.setValue({ email: 'sin-arroba', password: 'x' });
    componente.guardarCambios();
    expect(emitido).not.toHaveBeenCalled();
  });

  it('NO emite si falta el password', () => {
    componente.form.setValue({ email: 'ana@test.com', password: '' });
    componente.guardarCambios();
    expect(emitido).not.toHaveBeenCalled();
  });
});

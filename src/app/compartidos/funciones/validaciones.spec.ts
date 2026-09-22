import { FormControl } from '@angular/forms';
import { fechaNoPuedeSerFutura, primeraLetraMayuscula } from './validaciones';

describe('primeraLetraMayuscula', () => {
  const validar = (valor: any) => primeraLetraMayuscula()(new FormControl(valor));

  it('acepta un texto que inicia con mayúscula', () => {
    expect(validar('Acción')).toBeNull();
  });

  it('rechaza un texto que inicia con minúscula con el mensaje esperado', () => {
    expect(validar('acción')).toEqual({
      primeraLetraMayuscula: { mensaje: 'La primera letra debe ser mayúscula' },
    });
  });

  it('acepta cadena vacía y null (la obligatoriedad la valida otro validador)', () => {
    expect(validar('')).toBeNull();
    expect(validar(null)).toBeNull();
  });

  it('acepta un texto que inicia con dígito o espacio (no tienen mayúscula)', () => {
    expect(validar('3 Idiotas')).toBeNull();
    expect(validar(' hola')).toBeNull();
  });

  it('valida solo la primera letra (el resto puede ir en minúscula)', () => {
    expect(validar('Aaaa bbb')).toBeNull();
  });
});

describe('fechaNoPuedeSerFutura', () => {
  const validar = (valor: any) => fechaNoPuedeSerFutura()(new FormControl(valor));

  it('acepta una fecha pasada', () => {
    expect(validar(new Date('2000-01-01'))).toBeNull();
  });

  it('rechaza una fecha futura con el mensaje esperado', () => {
    const futura = new Date(Date.now() + 86_400_000);
    expect(validar(futura)).toEqual({ futuro: { mensaje: 'La fecha no puede ser del futuro' } });
  });

  it('acepta una fecha de hace un instante (límite inferior a "ahora")', () => {
    expect(validar(new Date(Date.now() - 1_000))).toBeNull();
  });

  it('rechaza una fecha apenas unos segundos en el futuro (límite superior)', () => {
    expect(validar(new Date(Date.now() + 5_000))).toEqual({ futuro: { mensaje: 'La fecha no puede ser del futuro' } });
  });

  it('acepta valor null o vacío (no lo trata como futuro)', () => {
    expect(validar(null)).toBeNull();
    expect(validar(undefined)).toBeNull();
  });
});

import { construirQueryParams } from './construirQueryParams';

describe('construirQueryParams', () => {
  it('convierte cada propiedad del objeto en un query param', () => {
    const params = construirQueryParams({ pagina: 2, titulo: 'dune', enCines: true });
    expect(params.get('pagina')).toBe('2');
    expect(params.get('titulo')).toBe('dune');
    expect(params.get('enCines')).toBe('true');
  });

  it('devuelve HttpParams vacío para un objeto vacío', () => {
    expect(construirQueryParams({}).keys().length).toBe(0);
  });

  it('conserva los valores 0, false y cadena vacía', () => {
    const params = construirQueryParams({ cero: 0, falso: false, vacio: '' });
    expect(params.get('cero')).toBe('0');
    expect(params.get('falso')).toBe('false');
    expect(params.get('vacio')).toBe('');
  });

  it('ignora las propiedades heredadas del prototipo', () => {
    const obj = Object.create({ heredada: 'x' });
    obj.propia = 'y';
    const params = construirQueryParams(obj);
    expect(params.has('heredada')).toBeFalse();
    expect(params.get('propia')).toBe('y');
  });

  it('codifica caracteres especiales al serializar', () => {
    const params = construirQueryParams({ titulo: 'Amor & Paz' });
    expect(params.toString()).toBe('titulo=Amor%20%26%20Paz');
  });
});

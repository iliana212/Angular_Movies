import { toBase64 } from './toBase64';

describe('toBase64', () => {
  it('convierte un archivo en un data URL base64', async () => {
    const archivo = new File(['hola'], 'a.txt', { type: 'text/plain' });
    await expectAsync(toBase64(archivo)).toBeResolvedTo('data:text/plain;base64,aG9sYQ==');
  });

  it('convierte un archivo vacío en un data URL sin contenido', async () => {
    const archivo = new File([], 'vacio.txt', { type: 'text/plain' });
    const resultado = await toBase64(archivo);
    expect(resultado).toMatch(/^data:.*;base64,$/);
  });

  it('rechaza la promesa cuando el argumento no es un archivo válido', async () => {
    await expectAsync(toBase64({} as File)).toBeRejected();
  });
});

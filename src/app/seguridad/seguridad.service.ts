import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { CredencialesUsuarioDTO, RespuestaAutenticacionDTO, UsuarioDTO } from './seguridad';
import { Observable, tap } from 'rxjs';
import { PaginacionDTO } from '../compartidos/modelos/PaginacionDTO';
import { construirQueryParams } from '../compartidos/funciones/construirQueryParams';

@Injectable({
  providedIn: 'root',
})
export class SeguridadService {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/usuarios';
  private readonly llaveToken = 'token';
  private readonly llaveExpiracion = 'token-expiracion';

  obtenerUsuariosPaginado(paginacion: PaginacionDTO): Observable<HttpResponse<UsuarioDTO[]>> {
    let queryParams = construirQueryParams(paginacion);
    return this.http.get<UsuarioDTO[]>(`${this.urlBase}/ListadoUsuarios`, { params: queryParams, observe: 'response' });
  }

  registrar(credenciales: CredencialesUsuarioDTO): Observable<RespuestaAutenticacionDTO> {
    return this.http.post<RespuestaAutenticacionDTO>(`${this.urlBase}/registrar`, credenciales)
      .pipe(
        tap(respuestaAutenticacion => this.guardarToken(respuestaAutenticacion))
      )
  }

  login(credenciales: CredencialesUsuarioDTO): Observable<RespuestaAutenticacionDTO> {
    return this.http.post<RespuestaAutenticacionDTO>(`${this.urlBase}/login`, credenciales)
      .pipe(
        tap(respuestaAutenticacion => this.guardarToken(respuestaAutenticacion))
      )
  }

  hacerAdmin(email: string) {
    return this.http.post(`${this.urlBase}/HacerAdmin`, { email });
  }

  removerAdmin(email: string) {
    return this.http.post(`${this.urlBase}/RemoverAdmin`, { email });
  }

  guardarToken(respuestaAutenticacion: RespuestaAutenticacionDTO) {
    localStorage.setItem(this.llaveToken, respuestaAutenticacion.token);
    localStorage.setItem(this.llaveExpiracion, respuestaAutenticacion.expiracion.toString());
  }

  obtenerCampoJWT(campo: string): string {
    const token = localStorage.getItem(this.llaveToken);
    if (!token) {
      return '';
    }

    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const dataToken = JSON.parse(atob(base64));
      return dataToken[campo];
    } catch {
      return '';
    }
  }

  estaLogueado(): boolean {
    const token = localStorage.getItem(this.llaveToken);
    if (!token) {
      return false;
    }

    const expiracion = localStorage.getItem(this.llaveExpiracion)!;
    const expiracionFecha = new Date(expiracion);
    if(isNaN(expiracionFecha.getTime()) || expiracionFecha <= new Date()){
      this.logout();
      return false;
    }

    return true;
  }

  logout() {
    localStorage.removeItem(this.llaveToken);
    localStorage.removeItem(this.llaveExpiracion);
  }

  obtenerRol(): string {
    const esAdmin = this.obtenerCampoJWT('esadmin');
    if (esAdmin) {
      return 'admin';
    } else {
      return '';
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.llaveToken);
  }
}

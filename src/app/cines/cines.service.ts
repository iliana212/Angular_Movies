import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { construirQueryParams } from '../compartidos/funciones/construirQueryParams';
import { PaginacionDTO } from '../compartidos/modelos/PaginacionDTO';
import { CineCreacionDTO, CineDTO } from './cines';
import { IServicioCRUD } from '../compartidos/interfaces/IServicioCRUD';

@Injectable({
  providedIn: 'root',
})
export class CinesService implements IServicioCRUD<CineDTO, CineCreacionDTO> {
  private http = inject(HttpClient);
  private urlBase = environment.apiURL + '/cines';

  public obtenerPaginado(paginacion: PaginacionDTO): Observable<HttpResponse<CineDTO[]>>{
    let queryParams = construirQueryParams(paginacion);
    return this.http.get<CineDTO[]>(this.urlBase, {params: queryParams, observe: "response"});
  }

  public obtenerPorId(id:number): Observable<CineDTO>{
    return this.http.get<CineDTO>(`${this.urlBase}/${id}`);
  }
  
  public crear(cine: CineCreacionDTO){
    return this.http.post(this.urlBase, cine);
  }

  public actualizar(id:number, cine: CineCreacionDTO){
    return this.http.put(`${this.urlBase}/${id}`, cine);
  }

  public borrar(id:number){
    return this.http.delete(`${this.urlBase}/${id}`);
  }
}

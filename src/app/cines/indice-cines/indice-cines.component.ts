import { HttpResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButton } from "@angular/material/button";
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from "@angular/router";
import Swal from 'sweetalert2';
import { PaginacionDTO } from '../../compartidos/modelos/PaginacionDTO';
import { CineDTO } from '../cines';
import { CinesService } from '../cines.service';
import { ListadoGenericoComponent } from '../../compartidos/componentes/listado-generico/listado-generico.component';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-indice-cines',
  imports: [MatButton, RouterLink, ListadoGenericoComponent, MatTableModule, MatPaginatorModule],
  templateUrl: './indice-cines.component.html',
  styleUrl: './indice-cines.component.css'
})

export class IndiceCinesComponent {
  cinesService = inject(CinesService);
  cines!: CineDTO[];
  columnasAMostrar = ['id', 'nombre', 'acciones'];
  paginacion: PaginacionDTO = { pagina: 1, recordsPorPagina: 3 };
  cantidadTotalRegistros!: number;

  constructor() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.cinesService.obtenerPaginado(this.paginacion).subscribe((respuesta: HttpResponse<CineDTO[]>) => {
      this.cines = respuesta.body as CineDTO[];
      const cabecera = respuesta.headers.get("cantidad-total-registros") as string;
      this.cantidadTotalRegistros = parseInt(cabecera, 10);
    });
  }

  actualizarPaginacion(datos: PageEvent) {
    this.paginacion = { pagina: datos.pageIndex + 1, recordsPorPagina: datos.pageSize };
    this.cargarRegistros();
  }

  borrar(id: number) {
    Swal.fire({
      title: '¿Desea borrar este registro?',
      text: 'El registro se eliminará permanentemente',
      icon: 'warning',
      theme: 'dark',
      showCancelButton: true,
      confirmButtonColor: '#810081',
      cancelButtonColor: '#313138',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cinesService.borrar(id).subscribe(() => {
          this.paginacion.pagina = 1;
          this.cargarRegistros();
        });
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GenerosService } from '../generos.service';
import { GeneroDTO } from '../generos';
import { MatTableModule } from '@angular/material/table';
import { ListadoGenericoComponent } from '../../compartidos/componentes/listado-generico/listado-generico.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpResponse } from '@angular/common/http';
import { PaginacionDTO } from '../../compartidos/modelos/PaginacionDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-indice-generos',
  imports: [RouterLink, MatButtonModule, MatTableModule, ListadoGenericoComponent, MatPaginatorModule],
  templateUrl: './indice-generos.component.html',
  styleUrl: './indice-generos.component.css'
})
export class IndiceGenerosComponent {
  generosService = inject(GenerosService);
  generos!: GeneroDTO[];
  columnasAMostrar = ['id', 'nombre', 'acciones'];
  paginacion: PaginacionDTO = { pagina: 1, recordsPorPagina: 3 };
  cantidadTotalRegistros!: number;

  constructor() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.generosService.obtenerPaginado(this.paginacion).subscribe((respuesta: HttpResponse<GeneroDTO[]>) => {
      this.generos = respuesta.body as GeneroDTO[];
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
        this.generosService.borrar(id).subscribe(() => {
          this.paginacion.pagina = 1;
          this.cargarRegistros();
        });
      }
    });
  }

}

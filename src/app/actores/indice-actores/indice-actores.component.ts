import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ActoresService } from '../actores.service';
import { PaginacionDTO } from '../../compartidos/modelos/PaginacionDTO';
import { ActorDTO } from '../actores';
import { HttpResponse } from '@angular/common/http';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { ListadoGenericoComponent } from '../../compartidos/componentes/listado-generico/listado-generico.component';
import { MatTableModule } from '@angular/material/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-indice-actores',
  imports: [RouterLink, MatButtonModule, MatTableModule, ListadoGenericoComponent, MatPaginatorModule],
  templateUrl: './indice-actores.component.html',
  styleUrl: './indice-actores.component.css'
})
export class IndiceActoresComponent {
  actoresService = inject(ActoresService);
  paginacion: PaginacionDTO = { pagina: 1, recordsPorPagina: 5 };
  cantidadTotalRegistros!: number;
  actores!: ActorDTO[];
  columnasAMostrar = ['id', 'nombre', 'fechaNacimiento', 'acciones'];

  constructor() {
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.actoresService.obtenerPaginado(this.paginacion).subscribe((respuesta: HttpResponse<ActorDTO[]>) => {
      this.actores = respuesta.body as ActorDTO[];
      const cabecera = respuesta.headers.get('cantidad-total-registros') as string;
      this.cantidadTotalRegistros = parseInt(cabecera, 10);
    })
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
        this.actoresService.borrar(id).subscribe(() => {
          this.paginacion.pagina = 1;
          this.cargarRegistros();
        });
      }
    });
  }
}

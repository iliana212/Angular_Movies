import { Component, inject, Input } from '@angular/core';
import { PaginacionDTO } from '../../modelos/PaginacionDTO';
import { SERVICIO_CRUD_TOKEN } from '../../proveedores/proveedores';
import { HttpResponse } from '@angular/common/http';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ListadoGenericoComponent } from '../listado-generico/listado-generico.component';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-indice-entidad',
  imports: [RouterLink, MatButtonModule, MatTableModule, ListadoGenericoComponent, MatPaginatorModule],
  templateUrl: './indice-entidad.html',
  styleUrl: './indice-entidad.css',
})
export class IndiceEntidadComponent<TDTO> {
  @Input({ required: true })
  titulo!: string;

  @Input({ required: true })
  rutaCrear!: string;

  @Input({ required: true })
  rutaEditar!: string;

  @Input()
  columnasAMostrar = [];

  paginacion: PaginacionDTO = { pagina: 1, recordsPorPagina: 5 };
  entidades!: TDTO[];
  servicioCRUD = inject(SERVICIO_CRUD_TOKEN) as any;
  cantidadTotalRegistros!: number;

  constructor() {
    this.cargarRegistros();
  }

  actualizarPaginacion(datos: PageEvent) {
    this.paginacion = { pagina: datos.pageIndex + 1, recordsPorPagina: datos.pageSize };
    this.cargarRegistros();
  }

  cargarRegistros() {
    this.servicioCRUD.obtenerPaginado(this.paginacion).subscribe((respuesta: HttpResponse<TDTO[]>) => {
      this.entidades = respuesta.body as TDTO[];
      const cabecera = respuesta.headers.get('cantidad-total-registros') as string;
      this.cantidadTotalRegistros = parseInt(cabecera, 10);
    })
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
        this.servicioCRUD.borrar(id).subscribe(() => {
          this.paginacion.pagina = 1;
          this.cargarRegistros();
        });
      }
    });
  }
}

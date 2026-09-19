import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ListadoGenericoComponent } from "../../compartidos/componentes/listado-generico/listado-generico.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from '@angular/router';
import { PeliculasService } from '../peliculas.service';
import Swal from 'sweetalert2';
import { AutorizadoComponent } from '../../seguridad/autorizado/autorizado';

@Component({
  selector: 'app-listado-peliculas',
  imports: [ListadoGenericoComponent, MatButtonModule, MatIconModule, RouterLink, AutorizadoComponent],
  templateUrl: './listado-peliculas.component.html',
  styleUrl: './listado-peliculas.component.css'
})
export class ListadoPeliculasComponent {
  @Input({required: true})
  peliculas!: any[];

  peliculasService = inject(PeliculasService);

  @Output()
  borrado = new EventEmitter<void>();

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
          this.peliculasService.borrar(id).subscribe(() => {
            this.borrado.emit();
          });
        }
      });
    }
}

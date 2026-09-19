import { Component, Input } from '@angular/core';
import { Cargando } from '../cargando/cargando';

@Component({
  selector: 'app-listado-generico',
  imports: [Cargando],
  templateUrl: './listado-generico.component.html',
  styleUrl: './listado-generico.component.css'
})
export class ListadoGenericoComponent {
  @Input({required:true})
  listado: any;
}

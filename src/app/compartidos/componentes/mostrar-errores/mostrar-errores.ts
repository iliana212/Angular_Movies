import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mostrar-errores',
  imports: [],
  templateUrl: './mostrar-errores.html',
  styleUrl: './mostrar-errores.css',
})
export class MostrarErroresComponent {
  @Input({required:true})
  errores!: string[];
}

import { Component, inject, Input, numberAttribute, OnInit } from '@angular/core';
import { CineCreacionDTO, CineDTO } from '../cines';
import { FormaularioCine } from "../formaulario-cine/formaulario-cine";
import { CinesService } from '../cines.service';
import { Router } from '@angular/router';
import { extraerErrores } from '../../compartidos/funciones/extraerErrores';
import { Cargando } from '../../compartidos/componentes/cargando/cargando';
import { MostrarErroresComponent } from '../../compartidos/componentes/mostrar-errores/mostrar-errores';

@Component({
  selector: 'app-editar-cine',
  imports: [FormaularioCine, Cargando, MostrarErroresComponent],
  templateUrl: './editar-cine.component.html',
  styleUrl: './editar-cine.component.css'
})
export class EditarCineComponent implements OnInit {
  ngOnInit(): void {
    this.cineService.obtenerPorId(this.id).subscribe(cine => {
      this.cine = cine;
    });
  }
  @Input({ transform: numberAttribute })
  id!: number;

  cine?: CineDTO;
  cineService = inject(CinesService);
  errores: string[] = [];
  router = inject(Router);

  guardarCambios(cine: CineCreacionDTO) {
    this.cineService.actualizar(this.id, cine).subscribe({
      next: () => {
        this.router.navigate(["/cines"]);
      },
      error: err => {
        const errores = extraerErrores(err);
        this.errores = errores;
      }
    });
  }
}

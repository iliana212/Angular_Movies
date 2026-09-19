import { Component, inject } from '@angular/core';
import { CineCreacionDTO } from '../cines';
import { FormaularioCine } from "../formaulario-cine/formaulario-cine";
import { CinesService } from '../cines.service';
import { Router } from '@angular/router';
import { extraerErrores } from '../../compartidos/funciones/extraerErrores';

@Component({
  selector: 'app-crear-cine',
  imports: [FormaularioCine],
  templateUrl: './crear-cine.component.html',
  styleUrl: './crear-cine.component.css'
})
export class CrearCineComponent {
  private router = inject(Router);
  private cinesService = inject(CinesService);
  errores: string[] = [];

  guardarCambios(genero: CineCreacionDTO) {
    this.cinesService.crear(genero).subscribe({
      next: () => {
        this.router.navigate(['/cines']);
      },
      error: err => {
        const errores = extraerErrores(err);
        this.errores = errores;
      }
    });
  } 
}

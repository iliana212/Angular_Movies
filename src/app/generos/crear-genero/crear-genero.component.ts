import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { primeraLetraMayuscula } from '../../compartidos/funciones/validaciones';
import { FormularioGeneroComponent } from "../formulario-genero/formulario-genero.component";
import { GeneroCreacionDTO } from '../generos';
import { GenerosService } from '../generos.service';
import { extraerErrores } from '../../compartidos/funciones/extraerErrores';
import { MostrarErroresComponent } from '../../compartidos/componentes/mostrar-errores/mostrar-errores';

@Component({
  selector: 'app-crear-genero',
  imports: [MatButtonModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, FormularioGeneroComponent, MostrarErroresComponent],
  templateUrl: './crear-genero.component.html',
  styleUrl: './crear-genero.component.css'
})
export class CrearGeneroComponent {
  private router = inject(Router);
  private generosService = inject(GenerosService);
  errores: string[] = [];

  guardarCambios(genero: GeneroCreacionDTO) {
    this.generosService.crear(genero).subscribe({
      next: () => {
        this.router.navigate(['/generos']);
      },
      error: err => {
        const errores = extraerErrores(err);
        this.errores = errores;
      }
    });
  } 
}

import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { extraerErroresIdentity } from '../../compartidos/funciones/extraerErrores';
import { CredencialesUsuarioDTO } from '../seguridad';
import { SeguridadService } from '../seguridad.service';
import { FormularioAutenticacionComponent } from '../formulario-autenticacion/formulario-autenticacion';

@Component({
  selector: 'app-registro',
  imports: [FormularioAutenticacionComponent],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {
  seguridadServices = inject(SeguridadService);
  router = inject(Router);
  errores: string[] = [];

  registrar(credenciales: CredencialesUsuarioDTO) {
    this.seguridadServices.registrar(credenciales).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: err => {
        const errores = extraerErroresIdentity(err);
        this.errores = errores;
      }
    })
  }
}

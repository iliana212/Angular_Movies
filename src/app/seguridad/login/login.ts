import { Component, inject } from '@angular/core';
import { SeguridadService } from '../seguridad.service';
import { Router } from '@angular/router';
import { CredencialesUsuarioDTO } from '../seguridad';
import { extraerErroresIdentity } from '../../compartidos/funciones/extraerErrores';
import { FormularioAutenticacionComponent } from '../formulario-autenticacion/formulario-autenticacion';

@Component({
  selector: 'app-login',
  imports: [FormularioAutenticacionComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  seguridadServices = inject(SeguridadService);
  router = inject(Router);
  errores: string[] = [];

  loguear(credenciales: CredencialesUsuarioDTO){
    this.seguridadServices.login(credenciales).subscribe({
      next: () =>{
        this.router.navigate(['/']);
      },
      error: err => {
        const errores = extraerErroresIdentity(err);
        this.errores = errores;
      }
    })
  }
}

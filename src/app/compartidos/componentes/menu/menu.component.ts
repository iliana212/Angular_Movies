import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AutorizadoComponent } from '../../../seguridad/autorizado/autorizado';
import { SeguridadService } from '../../../seguridad/seguridad.service';
@Component({
  selector: 'app-menu',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink, AutorizadoComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  seguridadService = inject(SeguridadService);
  router = inject(Router);

  hiToUser(): string {
    return 'Hola ' + this.seguridadService.obtenerCampoJWT('email');
  }

  logout(){
    this.seguridadService.logout();
    this.router.navigate(['/']);
  }
}

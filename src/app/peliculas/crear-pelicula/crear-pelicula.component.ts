import { Component, inject } from '@angular/core';
import { PeliculaCreacionDTO } from '../peliculas';
import { FormularioPelicula } from "../formulario-pelicula/formulario-pelicula";
import { SelectorMultipleDTO } from '../../compartidos/selector-multiple/SelectorMultipleModelo';
import { ActorAutocompleteDTO } from '../../actores/actores';
import { PeliculasService } from '../peliculas.service';
import { Router } from '@angular/router';
import { extraerErrores } from '../../compartidos/funciones/extraerErrores';
import { MostrarErroresComponent } from '../../compartidos/componentes/mostrar-errores/mostrar-errores';
import { Cargando } from '../../compartidos/componentes/cargando/cargando';

@Component({
  selector: 'app-crear-pelicula',
  imports: [FormularioPelicula, MostrarErroresComponent, Cargando],
  templateUrl: './crear-pelicula.component.html',
  styleUrl: './crear-pelicula.component.css'
})
export class CrearPeliculaComponent {
  generosSeleccionados: SelectorMultipleDTO[] = [];
  generosNoSeleccionados: SelectorMultipleDTO[] = [];
  cinesSeleccionados: SelectorMultipleDTO[] = [];
  cinesNoSeleccionados: SelectorMultipleDTO[] = []; 
  actoresSeleccionados: ActorAutocompleteDTO[] = [];

  peliculasService = inject(PeliculasService);
  router = inject(Router);
  errores: string[] = [];

  constructor(){
    this.peliculasService.crearGet().subscribe(modelo => {
      this.generosNoSeleccionados = modelo.generos.map(genero => {
        return <SelectorMultipleDTO>{llave: genero.id, valor: genero.nombre};
      });
      this.cinesNoSeleccionados = modelo.cines.map(cine => {
        return <SelectorMultipleDTO>{llave: cine.id, valor: cine.nombre};
      });
    })
  }
  
  guardarCambios(pelicula: PeliculaCreacionDTO){
    this.peliculasService.crear(pelicula).subscribe({
      next: (pelicula) => {
        console.log(pelicula);
        this.router.navigate(['/']);
      },
      error: (err) => {
        const errores = extraerErrores(err);
        this.errores = errores;
      }
    })
  }
}

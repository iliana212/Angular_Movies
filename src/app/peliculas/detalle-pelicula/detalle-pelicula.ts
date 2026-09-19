import { Component, inject, Input, numberAttribute, OnInit } from '@angular/core';
import { PeliculaDTO } from '../peliculas';
import { PeliculasService } from '../peliculas.service';
import { Cargando } from '../../compartidos/componentes/cargando/cargando';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Coordenada } from '../../compartidos/componentes/mapa/Coordenada';
import { Mapa } from '../../compartidos/componentes/mapa/mapa';
import { RatingService } from '../../compartidos/componentes/rating/rating.service';
import { SeguridadService } from '../../seguridad/seguridad.service';
import Swal from 'sweetalert2';
import { RatingComponent } from '../../compartidos/componentes/rating/rating.component';

@Component({
  selector: 'app-detalle-pelicula',
  imports: [Cargando, MatChipsModule, RouterLink, Mapa, RatingComponent],
  templateUrl: './detalle-pelicula.html',
  styleUrl: './detalle-pelicula.css',
})
export class DetallePeliculaComponent implements OnInit {
  ngOnInit(): void {
    this.peliculasService.obtenerPorId(this.id).subscribe(pelicula => {
      pelicula.fechaLanzamiento = new Date(pelicula.fechaLanzamiento);
      this.pelicula = pelicula;
      this.trailerURL = this.generarURLYouTubeEmbed(pelicula.trailer);
      this.coordenadas = pelicula.cines!.map(cine => {
        return <Coordenada>{ latitud: cine.latitud, longitud: cine.longitud, texto: cine.nombre };
      })
    });
  }

  @Input({ transform: numberAttribute })
  id!: number;

  pelicula!: PeliculaDTO;
  peliculasService = inject(PeliculasService);
  ratingService = inject(RatingService);
  seguridadService = inject(SeguridadService);
  sanitizer = inject(DomSanitizer);
  trailerURL!: SafeResourceUrl;
  coordenadas: Coordenada[] = [];

  generarURLYouTubeEmbed(url: string): SafeResourceUrl | string {
    if (!url) {
      return '';
    }

    var videoId = url.split('v=')[1];
    var posicionAmpersand = videoId.indexOf('&');
    if (posicionAmpersand !== -1) {
      videoId = videoId.substring(0, posicionAmpersand);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://youtube.com/embed/${videoId}`);
  }

  puntuar(puntuacion: number) {
    if (!this.seguridadService.estaLogueado()) {
      Swal.fire({
        title: 'Error',
        text: 'Debes loguearte para votar por una película',
        icon: 'error',
        theme: 'dark'
      });
      return;
    }

    this.ratingService.puntuar(this.id, puntuacion).subscribe(() => {
      Swal.fire({
        title: 'Exitoso',
        text: 'Su voto ha sido recibido',
        icon: 'success',
        theme: 'dark'
      });
    });
  }

}

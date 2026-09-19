import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {icon, latLng, LeafletMouseEvent, marker, Marker, MarkerOptions, tileLayer } from 'leaflet';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { Coordenada } from './Coordenada';

@Component({
  selector: 'app-mapa',
  imports: [LeafletModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements OnInit{
  ngOnInit(): void {
    this.capas = this.coordenadasIniciales.map(valor => {
      const marcador = marker([valor.latitud, valor.longitud], this.markerOptions);
      if (valor.texto){
        marcador.bindPopup(valor.texto, {autoClose: false, autoPan: false});
      }
      return marcador;
    })
  }
  @Input()
  coordenadasIniciales: Coordenada[] = [];

  @Input()
  soloLectura: boolean = false;

  @Output()
  coordenadaSeleccionada = new EventEmitter<Coordenada>();

  markerOptions: MarkerOptions = {
    icon: icon({
      iconSize: [25,41],
      iconAnchor: [13,41],
      iconUrl: 'assets/marker-icon.png',
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      shadowUrl: 'assets/marker-shadow.png'
    })
  }

  options= {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '...'
      })
    ],
    zoom: 14,
    center: latLng(22.750866690656913, -102.52696358976462)
  }

  capas: Marker<any>[] = [];

  manejarClick(event: LeafletMouseEvent){
    if(this.soloLectura){
      return;
    }

    const latitud = event.latlng.lat;
    const longitud = event.latlng.lng;

    this.capas = [];
    this.capas.push(marker([latitud, longitud], this.markerOptions));
    this.coordenadaSeleccionada.emit({latitud, longitud});
  }

}

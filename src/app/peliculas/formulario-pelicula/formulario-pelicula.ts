import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { InputImg } from '../../compartidos/componentes/input-img/input-img';
import { PeliculaCreacionDTO, PeliculaDTO } from '../peliculas';
import moment from 'moment';
import { SelectorMultipleDTO } from '../../compartidos/selector-multiple/SelectorMultipleModelo';
import { SelectorMultiple } from '../../compartidos/selector-multiple/selector-multiple';
import { AutocompleteActores } from '../../actores/autocomplete-actores/autocomplete-actores';
import { ActorAutocompleteDTO } from '../../actores/actores';

@Component({
  selector: 'app-formulario-pelicula',
  imports: [MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatButtonModule, RouterLink, MatDatepickerModule, InputImg, SelectorMultiple, AutocompleteActores],
  templateUrl: './formulario-pelicula.html',
  styleUrl: './formulario-pelicula.css',
})
export class FormularioPelicula implements OnInit {
  ngOnInit(): void {
    if (this.modelo !== undefined){
      this.form.patchValue(this.modelo);
    }
  }

  @Input()
  modelo?: PeliculaDTO;

  @Input({required: true})
  generosNoSeleccionados!: SelectorMultipleDTO[];

  @Input({required: true})
  generosSeleccionados!: SelectorMultipleDTO[];

  @Input({required: true})
  cinesNoSeleccionados!: SelectorMultipleDTO[];

  @Input({required: true})
  actoresSeleccionados!: ActorAutocompleteDTO[];

  @Input({required: true})
  cinesSeleccionados!: SelectorMultipleDTO[];

  @Output()
  posteoFormulario = new EventEmitter<PeliculaCreacionDTO>();

  private formBuilder = inject(FormBuilder);
  form = this.formBuilder.group({
    titulo: ['', {validators: [Validators.required]}],
    fechaLanzamiento: new FormControl<Date | null>(null, {validators: [Validators.required]}),
    trailer: '',
    poster: new FormControl<File | string | null>(null)
  });

  archivoSeleccionado(file: File){
    this.form.controls.poster.setValue(file);
  }

  guardarCambios(){
    if (!this.form.valid){
      return;
    }

    const pelicula = this.form.value as PeliculaCreacionDTO;
    pelicula.fechaLanzamiento = moment(pelicula.fechaLanzamiento).toDate();
    const generosIds = this.generosSeleccionados.map(val => val.llave);
    pelicula.generosIds = generosIds;
    const cinesIds = this.cinesSeleccionados.map(val => val.llave);
    pelicula.cinesIds = cinesIds;
    pelicula.actores = this.actoresSeleccionados;
    
    this.posteoFormulario.emit(pelicula);
  } 

  obtenerErrorCampoTitulo(): string{
    let campo = this.form.controls.titulo;
    if(campo.hasError('required')){
      return 'El campo Titulo es obligatorio';
    }
    return "";
  }

  obtenerErrorCampoFecha(): string{
    let campo = this.form.controls.fechaLanzamiento;
    if(campo.hasError('required')){
      return 'El campo Fecha de Lanzamiento es obligatorio';
    }
    return "";
  }



}

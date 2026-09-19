import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatTable, MatTableModule } from '@angular/material/table';
import { ActorAutocompleteDTO } from '../actores';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActoresService } from '../actores.service';

@Component({
  selector: 'app-autocomplete-actores',
  imports: [MatAutocompleteModule, ReactiveFormsModule, MatFormFieldModule, MatIconModule, FormsModule, MatTableModule, MatInputModule, DragDropModule],
  templateUrl: './autocomplete-actores.html',
  styleUrl: './autocomplete-actores.css',
})
export class AutocompleteActores implements OnInit {
  ngOnInit(): void {
    this.control.valueChanges.subscribe(valor => {
      if (typeof valor === 'string' && valor){
        this.actoresService.obtenerPorNombre(valor).subscribe(actores => {
          this.actores = actores;
        });
      }
    });
  }
  control = new FormControl();
  actores: ActorAutocompleteDTO[] = [];

  actoresService = inject(ActoresService);

  @Input({required: true})
  actoresSeleccionados: ActorAutocompleteDTO[] = [];
  
  columnasAMostrar = ['imagen', 'nombre', 'personaje', 'acciones'];

  @ViewChild(MatTable) table!: MatTable<ActorAutocompleteDTO>;

  actorSeleccionado(event: MatAutocompleteSelectedEvent){
    this.actoresSeleccionados.push(event.option.value);
    this.control.patchValue('');
    if (this.table != undefined){
      this.table.renderRows();
    }
  }

  finalizarArrastre(event: CdkDragDrop<any[]>){
    const indicePrevio = this.actoresSeleccionados.findIndex(actor => actor === event.item.data);
    moveItemInArray(this.actoresSeleccionados, indicePrevio, event.currentIndex);
    this.table.renderRows();
  }

  eliminar(actor: ActorAutocompleteDTO){
    const indice = this.actoresSeleccionados.findIndex((a: ActorAutocompleteDTO) => a.id === actor.id);
    this.actoresSeleccionados.splice(indice, 1);
    this.table.renderRows();
  }
}

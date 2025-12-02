import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [CommonModule, FormsModule]
})
export class Navbar {
  @Input() usuarioNome: string | null = null;
  @Output() sairEvent = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() navigate = new EventEmitter<string>();
  @Output() favoritosEvent = new EventEmitter<void>();

  termo: string = '';

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.termo.trim() !== '') {
      this.search.emit(this.termo.trim());
    }
  }

  sair() {
    this.sairEvent.emit();
  }

  exibirFavoritos() {
    this.favoritosEvent.emit();
  }

  // apenas emite o ID da seção
  emitNavigate(event: Event, sectionId: string) {
    event.preventDefault();
    this.navigate.emit(sectionId);
  }
}

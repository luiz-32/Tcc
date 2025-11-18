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

  // emite para o componente principal rolar até a seção
  @Output() navigate = new EventEmitter<string>();

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

  // apenas emite o ID da seção
  emitNavigate(event: Event, sectionId: string) {
    event.preventDefault();
    this.navigate.emit(sectionId);
  }
}

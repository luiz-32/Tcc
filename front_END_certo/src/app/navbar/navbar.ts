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
}

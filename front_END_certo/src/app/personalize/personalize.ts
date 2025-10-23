import { Component } from '@angular/core';
import { Router } from '@angular/router';  // <-- importar aqui
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personalize',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personalize.html',
  styleUrls: ['./personalize.css'],
})
export class PersonalizeComponent {
  constructor(private router: Router) {}  // <-- injetar aqui

  voltar() {
    this.router.navigate(['/principal']);
  }
}

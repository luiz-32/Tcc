import { Component } from '@angular/core';
import { Router } from '@angular/router';  // <-- importar aqui

@Component({
  selector: 'app-personalize',
  standalone: true,
  templateUrl: './personalize.html',
  styleUrls: ['./personalize.css'],
})
export class PersonalizeComponent {
  constructor(private router: Router) {}  // <-- injetar aqui

  voltar() {
    this.router.navigate(['/principal']);
  }
}

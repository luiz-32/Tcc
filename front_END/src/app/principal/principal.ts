// src/app/principal/principal.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.html',
  styleUrls: ['./principal.css']
})
export class PrincipalComponent implements OnInit {
  usuarioNome: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.usuarioNome = localStorage.getItem('usuarioLogado');
  }

  sair(): void {
    // Fecha qualquer modal Bootstrap aberta
    const modalAberta = document.querySelector('.modal.show') as any;
    if (modalAberta) {
      // Usa Bootstrap para fechar
      const modalBackdrop = document.querySelector('.modal-backdrop');
      modalAberta.classList.remove('show');
      modalAberta.setAttribute('aria-hidden', 'true');
      modalAberta.removeAttribute('aria-modal');
      if (modalBackdrop) modalBackdrop.remove();
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
    }

    // Agora faz logout e redireciona
    this.auth.logout();
    this.router.navigate(['/inicial']);
    console.log("saida feita com sucesso")
  }
}

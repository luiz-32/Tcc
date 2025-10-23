import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlimentosService, Alimento } from '../services/alimentos.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';


@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.html',
  styleUrls: ['./principal.css'],
  imports: [
    CommonModule,
    HttpClientModule, Navbar // 👈 bota essa desgraça aqui!
  ]
})
export class PrincipalComponent implements OnInit {
  usuarioNome: string | null = null;
  alimentosVeganos: Alimento[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private alimentosService: AlimentosService
  ) {}

  ngOnInit(): void {
    this.usuarioNome = localStorage.getItem('usuarioLogado');
    this.carregarAlimentos();
  }

  sair(): void {
    const modalAberta = document.querySelector('.modal.show') as any;
    if (modalAberta) {
      const modalBackdrop = document.querySelector('.modal-backdrop');
      modalAberta.classList.remove('show');
      modalAberta.setAttribute('aria-hidden', 'true');
      modalAberta.removeAttribute('aria-modal');
      if (modalBackdrop) modalBackdrop.remove();
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
    }

    this.auth.logout();
    this.router.navigate(['/inicial']);
    console.log("saida feita com sucesso");
  }

  carregarAlimentos(): void {
    this.alimentosService.getAlimentos().subscribe(
      (alimentos: Alimento[]) => {
        this.alimentosVeganos = alimentos.filter(a => a.vegano);
        console.log(this.alimentosVeganos);
      },
      (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar alimentos:', erro);
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';
import { AuthService } from '../services/auth.service';
import { AlimentosService, Alimento } from '../services/alimentos.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.html',
  styleUrls: ['./principal.css'],
  imports: [CommonModule, HttpClientModule, Navbar]
})
export class PrincipalComponent implements OnInit {
  usuarioNome: string | null = null;
  alimentosRecomendados: Alimento[] = [];
  tipoDieta: string | null = null; // null = tela inicial
  todosAlimentos: Alimento[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private alimentosService: AlimentosService
  ) {}

  ngOnInit(): void {
    this.usuarioNome = localStorage.getItem('usuarioLogado');
    this.carregarAlimentos();
  }

  carregarAlimentos(): void {
    this.alimentosService.getAlimentos().subscribe(
      (alimentos: Alimento[]) => {
        this.todosAlimentos = alimentos;
        this.alimentosRecomendados = alimentos.slice(0, 6); // Recomendação inicial
      },
      (erro: HttpErrorResponse) => {
        console.error('Erro ao carregar alimentos:', erro);
      }
    );
  }

  mudarDieta(tipo: string): void {
    this.tipoDieta = tipo;
    this.filtrarAlimentosPorDieta();
  }

  filtrarAlimentosPorDieta(): void {
    if (!this.tipoDieta) return;

    switch (this.tipoDieta.toUpperCase()) {
      case 'VEGANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.vegano);
        break;
      case 'VEGETARIANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.vegetariano);
        break;
      case 'OVOLACTO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.ovolacto);
        break;
      case 'INTOLERANTE_LACTOSE':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.intolerante_lactose);
        break;
      default:
        this.alimentosRecomendados = this.todosAlimentos;
    }
  }

  voltar(): void {
    this.tipoDieta = null; // volta para a tela de escolha de dieta
  }


  sair(): void {
    this.auth.logout();
    this.router.navigate(['/inicial']);
  }
}

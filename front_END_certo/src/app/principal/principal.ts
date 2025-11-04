import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
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
  @ViewChild(Navbar) navbar!: Navbar;

  usuarioNome: string | null = null;
  alimentosRecomendados: Alimento[] = [];
  todosAlimentos: Alimento[] = [];

  tipoDieta: string | null = null;

  modoPesquisa = false;
  resultadosPesquisa: Alimento[] = [];
  mensagemAviso: string = "";

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
    this.alimentosService.getAlimentos().subscribe({
      next: alimentos => {
        this.todosAlimentos = alimentos;
        this.alimentosRecomendados = alimentos.slice(0, 6);
      },
      error: erro => console.error("Erro ao carregar alimentos", erro)
    });
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
      case 'OVOLACTOVEGETARIANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.ovolacto);
        break;
      case 'INTOLERANTE_LACTOSE':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.intolerante_lactose);
        break;
      case 'INTOLERANTE_GLUTEN':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.intolerante_gluten);
        break;
    }
  }

  pesquisarAlimentos(termo: string) {
    this.modoPesquisa = true;
    this.tipoDieta = null;

    const termoLower = termo.toLowerCase();

    this.resultadosPesquisa = this.todosAlimentos.filter(a =>
      a.nome.toLowerCase().includes(termoLower)
    );

    this.mensagemAviso =
      this.resultadosPesquisa.length === 0
        ? "Nenhum alimento encontrado."
        : "";
  }

  sairPesquisa() {
    this.modoPesquisa = false;
    this.resultadosPesquisa = [];
    this.mensagemAviso = "";

    this.navbar.termo = "";
  }

 voltar(): void {
  this.tipoDieta = null;
  this.modoPesquisa = false;
  this.resultadosPesquisa = [];
  this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
}


  sair(): void {
    this.auth.logout();
    this.router.navigate(['/inicial']);
  }
  
}

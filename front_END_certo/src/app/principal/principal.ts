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

  todosAlimentos: Alimento[] = [];
  alimentosRecomendados: Alimento[] = [];

  resultadosPesquisa: Alimento[] = [];
  modoPesquisa = false;

  tipoDieta: string | null = null;

  alimentoSelecionado: Alimento | null = null;

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
    this.modoPesquisa = false;

    switch (tipo) {
      case 'VEGANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.vegano);
        break;
      case 'VEGETARIANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.vegetariano);
        break;
      case 'OVOLACTOVEGETARIANO':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.ovolacto);
        break;
      case 'INTOLERANTE Á LACTOSE':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.intolerante_lactose);
        break;
      case 'INTOLERANTE Á GLUTEN':
        this.alimentosRecomendados = this.todosAlimentos.filter(a => a.intolerante_gluten);
        break;
    }
  }

  pesquisarAlimentos(termo: string) {
    termo = termo.trim().toLowerCase();

    if (termo === "") {
      this.resultadosPesquisa = [];
      this.modoPesquisa = false;
      return;
    }

    this.modoPesquisa = true;
    this.tipoDieta = null;

    this.resultadosPesquisa = this.todosAlimentos.filter(a =>
      a.nome.toLowerCase().includes(termo)
    );
  }

  sairPesquisa() {
    this.resultadosPesquisa = [];
    this.modoPesquisa = false;
    this.navbar.termo = "";
  }

  voltar() {
    this.tipoDieta = null;
    this.modoPesquisa = false;
    this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
  }

  abrirModal(alimento: Alimento) {
    this.alimentoSelecionado = alimento;
  }

  fecharModal() {
    this.alimentoSelecionado = null;
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/inicial']);
  }
}

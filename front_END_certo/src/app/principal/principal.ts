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

  // ✅ Novos atributos de categoria
  categorias: any[] = [];
  categoriaSelecionada: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private alimentosService: AlimentosService
  ) {}

  ngOnInit(): void {
    this.usuarioNome = localStorage.getItem('usuarioLogado');
    this.carregarAlimentos();
    this.carregarCategorias();
    this.carregarCategoriasComAlimentos(); // 👈 novo
  }
  
rolar(elemento: HTMLElement, direcao: 'esquerda' | 'direita') {
  const largura = elemento.clientWidth;
  const scroll = direcao === 'direita' ? largura : -largura;
  elemento.scrollBy({ left: scroll, behavior: 'smooth' });
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
  carregarCategoriasComAlimentos(): void {
    this.alimentosService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.categorias.forEach(cat => {
          this.alimentosService.getAlimentosPorCategoria(cat.id).subscribe({
            next: (alimentos) => cat.alimentos = alimentos,
            error: (erro) => console.error("Erro ao carregar alimentos da categoria", cat.nome, erro)
          });
        });
      },
      error: (erro) => console.error("Erro ao carregar categorias", erro)
    });
  }

  // ✅ Novo: carregar categorias
  carregarCategorias(): void {
    this.alimentosService.getCategorias().subscribe({
      next: categorias => this.categorias = categorias,
      error: erro => console.error("Erro ao carregar categorias", erro)
    });
  }

  // ✅ Novo: filtrar alimentos por categoria
  filtrarPorCategoria(id: number, nome: string): void {
    this.tipoDieta = null;
    this.modoPesquisa = false;
    this.categoriaSelecionada = nome;
    

    this.alimentosService.getAlimentosPorCategoria(id).subscribe({
      next: alimentos => this.alimentosRecomendados = alimentos,
      error: erro => console.error("Erro ao filtrar por categoria", erro)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  mudarDieta(tipo: string): void {
    this.tipoDieta = tipo;
    this.modoPesquisa = false;
    this.categoriaSelecionada = null;

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

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pesquisarAlimentos(termo: string): void {
    termo = termo.trim().toLowerCase();

    if (termo === "") {
      this.resultadosPesquisa = [];
      this.modoPesquisa = false;
      return;
    }

    this.modoPesquisa = true;
    this.tipoDieta = null;
    this.categoriaSelecionada = null;

    this.resultadosPesquisa = this.todosAlimentos.filter(a =>
      a.nome.toLowerCase().includes(termo)
    );
  }

  sairPesquisa(): void {
    this.resultadosPesquisa = [];
    this.modoPesquisa = false;
    this.navbar.termo = "";
  }

  voltar(): void {
    this.tipoDieta = null;
    this.modoPesquisa = false;
    this.categoriaSelecionada = null;
    this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
  }

  abrirModal(alimento: Alimento): void {
    this.alimentoSelecionado = alimento;
  }

  fecharModal(): void {
    this.alimentoSelecionado = null;
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/inicial']);
  }
}

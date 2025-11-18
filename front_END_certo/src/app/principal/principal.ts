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
  categoriaSelecionada: string | null = null;

  categorias: any[] = [];
  alimentoSelecionado: Alimento | null = null;

  telaAnterior: 'HOME' | 'DIETA' | 'CATEGORIA' | null = null;
  dietaAnterior: string | null = null;
  categoriaAnterior: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private alimentosService: AlimentosService
  ) {}

  ngOnInit(): void {
    this.usuarioNome = localStorage.getItem('usuarioLogado');
    this.carregarAlimentos();
    this.carregarCategoriasComAlimentos();
  }

  private removerDuplicados(lista: Alimento[]): Alimento[] {
    return [...new Map(lista.map(a => [a.id, a])).values()];
  }

  carregarAlimentos(): void {
    this.alimentosService.getAlimentos().subscribe({
      next: alimentos => {
        this.todosAlimentos = this.removerDuplicados(alimentos);
        this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
      },
      error: erro => console.error("Erro ao carregar alimentos", erro)
    });
  }

  carregarCategoriasComAlimentos(): void {
    this.alimentosService.getCategorias().subscribe({
      next: categorias => {
        this.categorias = categorias;

        this.categorias.forEach(cat => {
          this.alimentosService.getAlimentosPorCategoria(cat.id).subscribe({
            next: alimentos => {
              cat.alimentos = this.removerDuplicados(alimentos);
            },
            error: () => console.error("Erro ao carregar alimentos de", cat.nome)
          });
        });
      }
    });
  }

  filtrarPorCategoria(id: number, nome: string): void {
    this.tipoDieta = null;
    this.modoPesquisa = false;
    this.categoriaSelecionada = nome;

    this.alimentosService.getAlimentosPorCategoria(id).subscribe({
      next: alimentos => {
        this.alimentosRecomendados = this.removerDuplicados(alimentos);

        // 🔥 SCROLL AUTOMÁTICO PARA O TOPO DA SEÇÃO
        setTimeout(() => this.scrollTo("secao-alimentos"), 80);
      }
    });
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

    this.alimentosRecomendados = this.removerDuplicados(this.alimentosRecomendados);

    // 🔥 SCROLL AUTOMÁTICO PARA O INÍCIO DA DIETA
    setTimeout(() => this.scrollTo("secao-alimentos"), 80);
  }


  // PESQUISA
  pesquisarAlimentos(termo: string): void {
    termo = termo.trim().toLowerCase();

    if (termo === "") {
      this.sairPesquisa();
      return;
    }

    if (!this.modoPesquisa) {
      if (this.tipoDieta) {
        this.telaAnterior = 'DIETA';
        this.dietaAnterior = this.tipoDieta;
      }
      else if (this.categoriaSelecionada) {
        this.telaAnterior = 'CATEGORIA';
        this.categoriaAnterior = this.categoriaSelecionada;
      }
      else {
        this.telaAnterior = 'HOME';
      }
    }

    this.modoPesquisa = true;
    this.tipoDieta = null;
    this.categoriaSelecionada = null;

    this.resultadosPesquisa = this.todosAlimentos.filter(a =>
      a.nome.toLowerCase().includes(termo)
    );

    this.resultadosPesquisa = this.removerDuplicados(this.resultadosPesquisa);
  }

  sairPesquisa(): void {
    this.resultadosPesquisa = [];
    this.modoPesquisa = false;

    try { if (this.navbar) this.navbar.termo = ""; } catch {}

    if (this.telaAnterior === 'DIETA' && this.dietaAnterior) {
      this.tipoDieta = this.dietaAnterior;
      this.mudarDieta(this.dietaAnterior);
    }
    else if (this.telaAnterior === 'CATEGORIA' && this.categoriaAnterior) {
      this.tipoDieta = null;
      this.categoriaSelecionada = this.categoriaAnterior;

      const categoria = this.categorias.find(
        c => c.nome === this.categoriaAnterior
      );

      if (categoria) {
        this.filtrarPorCategoria(categoria.id, categoria.nome);
      }
    }
    else {
      this.tipoDieta = null;
      this.categoriaSelecionada = null;
      this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  scrollTo(id: string) {
    setTimeout(() => {
      const elemento = document.getElementById(id);
      if (!elemento) return;

      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? (navbar as HTMLElement).offsetHeight : 80;

      const posicaoTop =
        elemento.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: posicaoTop,
        behavior: 'smooth'
      });
    }, 50);
  }

  rolar(elemento: HTMLElement, direcao: 'esquerda' | 'direita') {
    const largura = elemento.clientWidth;
    const scroll = direcao === 'direita' ? largura : -largura;
    elemento.scrollBy({ left: scroll, behavior: 'smooth' });
  }
}

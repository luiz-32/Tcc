import { Component, OnInit, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Navbar } from '../navbar/navbar';
import { ToastComponent } from '../toast/toast';
import { AuthService } from '../services/auth.service';
import { AlimentosService, Alimento } from '../services/alimentos.service';
import { FavoritosService, Favorito } from '../services/favoritos.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.html',
  styleUrls: ['./principal.css'],
  imports: [CommonModule, HttpClientModule, Navbar, ToastComponent]
})
export class PrincipalComponent implements OnInit, OnDestroy {
  @ViewChild(Navbar) navbar!: Navbar;

  // Track which navbar section is active for underline/highlight
  activeSection: string | null = 'home';

  usuarioNome: string | null = null;
  usuarioId: number | null = null;
  usuarioFoto: string | null = null;
  todosAlimentos: Alimento[] = [];
  alimentosRecomendados: Alimento[] = [];
  resultadosPesquisa: Alimento[] = [];
  modoPesquisa = false;
  favoritos: Favorito[] = [];
  modoFavoritos = false;
  // Loading flags per alimento id to avoid race conditions when toggling
  loadingFavorito: { [id: number]: boolean } = {};
  // Incremental id to ignore stale listarFavoritos responses
  private favoritosRequestId = 0;

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
    private alimentosService: AlimentosService,
    private favoritosService: FavoritosService,
    private toast: ToastService,
    private ngZone: NgZone
  ) {}

  private _onScrollBound = this.onScroll.bind(this);
  private _onResizeBound = this.onResize.bind(this);
  private _scrollTimer: any = null;

  // Handlers for profile actions emitted by Navbar
  onUploadPhoto(file: File) {
    // Placeholder: upload to server if endpoint exists. For now show toast.
    console.log('[onUploadPhoto] file:', file);
    this.toast.show('Foto enviada (simulada).', 'success');
  }

  onChangeName(newName: string) {
    this.toast.show('Alterando nome...', 'info');
    this.auth.changeUsername(newName).then(success => {
      if (success) {
        this.usuarioNome = newName;
        this.toast.show('Nome alterado com sucesso.', 'success');
        alert('Nome alterado com sucesso.');
      } else {
        this.toast.show('Falha ao alterar nome.', 'error');
        alert('Falha ao alterar nome. Veja o console para detalhes.');
      }
    });
  }

  onChangePassword(payload: { oldPassword: string; newPassword: string }) {
    this.toast.show('Alterando senha...', 'info');
    this.auth.changePassword(payload.oldPassword, payload.newPassword).then(success => {
      if (success) {
        this.toast.show('Senha alterada com sucesso.', 'success');
        alert('Senha alterada com sucesso.');
      } else {
        this.toast.show('Falha ao alterar senha.', 'error');
        alert('Falha ao alterar senha. Verifique a senha atual.');
      }
    });
  }

  onDeleteAccount(password: string) {
    this.toast.show('Excluindo conta...', 'info');
    this.auth.deleteUser(password).then(success => {
      if (success) {
        this.toast.show('Conta excluída.', 'success');
        // Clear UI state
        this.usuarioNome = null;
        this.usuarioId = null;
        this.favoritos = [];
        this.router.navigate(['/principal']);
        alert('Conta excluída com sucesso.');
      } else {
        this.toast.show('Falha ao excluir conta. Senha incorreta?', 'error');
        alert('Falha ao excluir conta. Senha incorreta?');
      }
    });
  }

  goToPerfil() {
    // Navigate to the perfil page
    this.router.navigate(['/perfil']);
  }

  ngOnInit(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.usuarioNome = localStorage.getItem('usuarioLogado');
        this.usuarioId = Number(localStorage.getItem('usuarioId')) || null;
      }
    } catch (e) {
      // ambiente sem localStorage (SSR) — não faz nada
      this.usuarioNome = null;
      this.usuarioId = null;
    }
    this.carregarAlimentos();
    this.carregarCategoriasComAlimentos();
    
    // IMPORTANTE: Carregar favoritos do servidor na inicialização
    if (this.usuarioId) {
      console.log('[ngOnInit] Carregando favoritos do servidor para usuário', this.usuarioId);
      this.carregarFavoritosDoServidor();
    }

    // Load profile photo for navbar
    this.loadProfileForNavbar();

    // Listen for auth-change events (login/logout/photo changes)
    try { window.addEventListener('auth-change', () => this.loadProfileForNavbar()); } catch (e) {}
    // Listen for page scroll to update active navbar section
    try { window.addEventListener('scroll', this._onScrollBound); } catch (e) {}
    // Listen for resize to recompute button offset when fixed
    try { window.addEventListener('resize', this._onResizeBound); } catch (e) {}
    // ensure layout accounts for navbar height
    try { this.updateLayoutForNavbar(); } catch (e) {}
    // Also listen on the main container in case the app uses a scrolling div
    try {
      const main = document.querySelector('.principal-container') as HTMLElement | null;
      if (main) {
        main.addEventListener('scroll', this._onScrollBound);
      }
    } catch (e) {}
  }

  ngOnDestroy(): void {
    try { window.removeEventListener('scroll', this._onScrollBound); } catch (e) {}
    try { window.removeEventListener('resize', this._onResizeBound); } catch (e) {}
    try {
      const main = document.querySelector('.principal-container') as HTMLElement | null;
      if (main) {
        main.removeEventListener('scroll', this._onScrollBound);
      }
    } catch (e) {}
  }

  private onScroll(): void {
    // debounce actual computation to ~80ms
    try {
      if (this._scrollTimer) clearTimeout(this._scrollTimer);
      this._scrollTimer = setTimeout(() => {
        try {
          const navbar = document.querySelector('nav');
          const navbarHeight = navbar ? (navbar as HTMLElement).offsetHeight : 80;
          const offset = navbarHeight + 8; // small buffer

          const ids = ['home', 'sobre', 'categorias', 'dietas', 'secao-alimentos'];
          const candidates: { id: string; top: number }[] = [];
          for (const id of ids) {
            const el = document.getElementById(id);
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            candidates.push({ id, top: rect.top });
          }

          let chosen: string | null = null;
          let bestTop = -Infinity;
          for (const c of candidates) {
            if (c.top <= offset && c.top > bestTop) {
              bestTop = c.top;
              chosen = c.id;
            }
          }

          if (!chosen && candidates.length > 0) {
            let minDist = Infinity;
            for (const c of candidates) {
              const d = Math.abs(c.top - offset);
              if (d < minDist) {
                minDist = d;
                chosen = c.id;
              }
            }
          }

          if (chosen) {
            let mapped = chosen;
            if (chosen === 'secao-alimentos') mapped = this.categoriaSelecionada ? 'categorias' : (this.tipoDieta ? 'dietas' : 'categorias');
            // debug log to help diagnose in browser console
            // dispatch section-change for navbar to react
            try { window.dispatchEvent(new CustomEvent('section-change', { detail: { chosen, mapped, ts: Date.now() } })); } catch (e) {}
            try { this.ngZone.run(() => { this.activeSection = mapped; }); } catch (e) { this.activeSection = mapped; }
          }

          // Shrink the fixed "Voltar" button when the header scrolls under the navbar
          try {
            const alimentos = document.querySelector('.alimentos-container') as HTMLElement | null;
            if (alimentos) {
              const headerEl = alimentos.querySelector('.header') as HTMLElement | null;
              const navbarEl = document.querySelector('nav') as HTMLElement | null;
              const navbarHeight = navbarEl ? navbarEl.offsetHeight : 80;
              if (headerEl) {
                const rect = headerEl.getBoundingClientRect();
                const shrinkThreshold = navbarHeight + 24; // when header top goes above this, shrink
                if (rect.top < shrinkThreshold) {
                  // Header scrolled up: make the button fixed and shrink it
                  alimentos.classList.add('voltar-fixed');
                  alimentos.classList.add('voltar-shrink');
                    // ensure the fixed button is positioned below the navbar
                    try { this.updateVoltarTop(); } catch (e) {}
                } else {
                  // Header visible: keep the button inline on the header
                  alimentos.classList.remove('voltar-fixed');
                  alimentos.classList.remove('voltar-shrink');
                    // remove any inline top to restore inline flow
                    try { this.updateVoltarTop(); } catch (e) {}
                }
              }
            }
          } catch (e) {}
        } catch (e) {}
      }, 80);
    } catch (e) {}
  }

  private onResize(): void {
    try {
      this.updateVoltarTop();
      this.updateLayoutForNavbar();
    } catch (e) {}
  }

  private updateVoltarTop(): void {
    try {
      const alimentos = document.querySelector('.alimentos-container') as HTMLElement | null;
      if (!alimentos) return;
      const voltarBtn = alimentos.querySelector('.voltar') as HTMLElement | null;
      if (!voltarBtn) return;
      const navbarEl = document.querySelector('nav') as HTMLElement | null;
      const navbarHeight = navbarEl ? navbarEl.offsetHeight : 80;
      if (alimentos.classList.contains('voltar-fixed')) {
        // place a bit below the navbar so it doesn't overlap
        const offset = navbarHeight + 8;
        voltarBtn.style.top = `${offset}px`;
        // ensure it's positioned fixed (CSS class already does, but inline top ensures correct offset)
        voltarBtn.style.position = 'fixed';
        // make sure it appears below the navbar by setting z-index lower than navbar if navbar has high z
        // (we prefer to keep the button visible, but not on top of the navbar)
      } else {
        // restore inline flow
        voltarBtn.style.removeProperty('top');
        voltarBtn.style.removeProperty('position');
      }
    } catch (e) {}
  }

  private updateLayoutForNavbar(): void {
    try {
      const navbarEl = document.querySelector('nav') as HTMLElement | null;
      const navbarHeight = navbarEl ? navbarEl.offsetHeight : 80;
      // set top margin on principal container so content is not hidden under the fixed navbar
      const principal = document.querySelector('.principal-container') as HTMLElement | null;
      if (principal) {
        principal.style.marginTop = `${navbarHeight}px`;
      }
      // also set the html scroll-padding-top to help anchor scrolling
      try { document.documentElement.style.setProperty('scroll-padding-top', `${navbarHeight}px`); } catch (e) {}
    } catch (e) {}
  }

  // Scroll the top of the main content (below the fixed navbar)
  private scrollToTopContent(delay: number = 0): void {
    try {
      setTimeout(() => {
        const navbar = document.querySelector('nav') as HTMLElement | null;
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const principal = document.querySelector('.principal-container') as HTMLElement | null;
        const top = principal ? (principal.getBoundingClientRect().top + window.scrollY - navbarHeight) : 0;
        window.scrollTo({ top, behavior: 'smooth' });
      }, delay);
    } catch (e) {}
  }

  private loadProfileForNavbar() {
    try {
      // Try to read cached foto first
      const cached = localStorage.getItem('usuarioFoto');
      const cachedId = Number(localStorage.getItem('usuarioFotoId')) || null;
      // Use cached only when it belongs to the currently logged user
      if (cached && this.usuarioId && cachedId === this.usuarioId) {
        this.usuarioFoto = cached;
        return;
      }
      // Otherwise fetch from server if logged in
      if (this.usuarioId) {
        this.auth.getProfile().then((res: any) => {
          this.usuarioFoto = (res && res.foto_perfil) ? res.foto_perfil : null;
        }).catch(() => {
          this.usuarioFoto = null;
        });
      } else {
        this.usuarioFoto = null;
      }
    } catch (e) { this.usuarioFoto = null; }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToCadastro(): void {
    this.router.navigate(['/cadastro']);
  }

  private removerDuplicados(lista: Alimento[]): Alimento[] {
    return [...new Map(lista.map(a => [a.id, a])).values()];
  }
  voltar(): void {
    // 🔹 Se estiver em favoritos → voltar para HOME
    if (this.modoFavoritos) {
      this.sairFavoritos();
      return;
    }

    // 🔹 Se estiver em pesquisa → voltar para a tela anterior
    if (this.modoPesquisa) {
      this.sairPesquisa();
      return;
    }

    // 🔹 Se estiver em DIETA → voltar para HOME
    if (this.tipoDieta) {
      this.tipoDieta = null;
      this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 🔹 Se estiver em CATEGORIA → voltar para HOME
    if (this.categoriaSelecionada) {
      this.categoriaSelecionada = null;
      this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 🔹 Se já está na HOME → não faz nada
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // 🔥 SCROLL AUTOMÁTICO PARA OTOPO DO CONTEÚDO (espero o render)
        setTimeout(() => this.scrollToTopContent(), 160);
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

    // 🔥 SCROLL PARA O TOPO DO CONTEÚDO E MARCAR 'DIETAS' COMO ATIVO
    setTimeout(() => {
      this.scrollToTopContent();
      try { this.activeSection = 'dietas'; } catch (e) {}
      try { window.dispatchEvent(new CustomEvent('section-change', { detail: { chosen: 'dietas', mapped: 'dietas', ts: Date.now() } })); } catch (e) {}
    }, 160);
  }


  // PESQUISA
  // 🔥🔥🔥 ALTERAÇÕES JÁ INCLUÍDAS 🔥🔥🔥

pesquisarAlimentos(termo: string): void {

  // 🔥 SE ESTIVER EM FAVORITOS, SAIR AUTOMATICAMENTE
  if (this.modoFavoritos) {
    this.modoFavoritos = false;
  }

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
    if (!this.usuarioId) {
      this.solicitarLoginCadastro();
      return;
    }

    this.alimentoSelecionado = alimento;
  }

  fecharModal(): void {
    this.alimentoSelecionado = null;
  }

  // ========== MÉTODOS DE FAVORITOS ==========
  
  carregarFavoritos(): void {
    if (!this.usuarioId) return;

    const currentRequest = ++this.favoritosRequestId;
    this.favoritosService.listarFavoritos(this.usuarioId).subscribe({
      next: favoritos => {
        // Ignore stale responses
        if (currentRequest !== this.favoritosRequestId) return;

        console.log('[carregarFavoritos] Recebido do backend:', favoritos.length, 'favoritos');

        // Normalizar ids numéricos (backend pode retornar strings)
        this.favoritos = favoritos.map(f => ({
          ...f,
          id: Number((f as any).id),
          id_usuario: Number((f as any).id_usuario),
          id_alimento: Number((f as any).id_alimento)
        } as Favorito));

        console.log('[carregarFavoritos] this.favoritos atualizado:', this.favoritos.length);
        console.log('[carregarFavoritos] modoFavoritos=', this.modoFavoritos);

        // Se estivermos em modo Favoritos, atualizar a lista exibida
        if (this.modoFavoritos) {
          console.log('[carregarFavoritos] Atualizando alimentosRecomendados...');
          this.alimentosRecomendados = this.favoritos.map(f => ({
            id: f.id_alimento,
            nome: f.nome,
            intolerante_lactose: (f as any).intolerante_lactose,
            vegetariano: (f as any).vegetariano,
            vegano: (f as any).vegano,
            ovolacto: (f as any).ovolacto,
            intolerante_gluten: (f as any).intolerante_gluten,
            imagem: f.imagem,
            descricao: f.descricao,
            categoria: f.categoria
          } as Alimento));
          console.log('[carregarFavoritos] alimentosRecomendados agora tem', this.alimentosRecomendados.length, 'items');
          setTimeout(() => this.scrollToTopContent(), 160);
        }
      },
      error: erro => {
        if (currentRequest !== this.favoritosRequestId) return;
        console.error("Erro ao carregar favoritos", erro)
      }
    });
  }

  // Carrega favoritos do servidor de forma direta (uso em ngOnInit)
  carregarFavoritosDoServidor(): void {
    if (!this.usuarioId) return;

    console.log('[carregarFavoritosDoServidor] iniciando para usuario', this.usuarioId);
    this.favoritosService.listarFavoritos(this.usuarioId).subscribe({
      next: favoritos => {
        // Normalizar ids numéricos
        this.favoritos = favoritos.map(f => ({
          ...f,
          id: Number((f as any).id),
          id_usuario: Number((f as any).id_usuario),
          id_alimento: Number((f as any).id_alimento)
        } as Favorito));

        console.log('[carregarFavoritosDoServidor] favoritos carregados:', this.favoritos.length);

        // Se estivermos no modo favoritos, atualizar a exibição
        if (this.modoFavoritos) {
          this.atualizarAlimentosFavoritos();
        }
      },
      error: err => console.error('[carregarFavoritosDoServidor] erro', err)
    });
  }

  adicionarFavorito(alimento: Alimento): void {
    if (!this.usuarioId) {
      // Se não estiver logado, redirecionar para a tela inicial conforme solicitado
      console.warn("Usuário não está logado — redirecionando para /inicial");
      this.router.navigate(['/inicial']);
      return;
    }

    const rawId: any = (alimento as any).id ?? (alimento as any).id_alimento ?? null;
    const alimentoId = rawId != null ? Number(rawId) : null;
    if (!alimentoId) {
      console.error('[adicionarFavorito] Alimento sem id válido:', alimento);
      return;
    }

    this.favoritosService.adicionarFavorito(Number(this.usuarioId), Number(alimentoId)).subscribe({
      next: (novoFavorito) => {
        // Adicionar imediatamente ao array local para atualizar a UI
        const f = {
          ...novoFavorito,
          id: Number((novoFavorito as any).id),
          id_usuario: Number((novoFavorito as any).id_usuario),
          id_alimento: Number((novoFavorito as any).id_alimento)
        } as Favorito;
        this.favoritos.push(f);
        console.log("Favorito adicionado. Total agora:", this.favoritos.length, f);
      },
      error: erro => {
        console.error("Erro ao adicionar favorito:", erro);
      }
    });
  }

  // Unified handler to toggle favorito from template; stops propagation to avoid opening modal
  onToggleFavorito(event: Event, alimento: Alimento): void {
    event.stopPropagation();

    // Normalize and extract alimento id (some flows may provide id_alimento)
    const rawId: any = (alimento as any).id ?? (alimento as any).id_alimento ?? null;
    const alimentoId = rawId != null ? Number(rawId) : null;
    console.log(`[onToggleFavorito] CLICADO - usuarioId=${this.usuarioId}, alimentoId=${alimentoId}, isFavorito=${this.isFavorito(alimentoId ?? -1)}`);

    if (!this.usuarioId) {
      // Se não estiver logado, redirecionar para a tela inicial
      console.warn('Usuário não está logado — redirecionando para /inicial');
      this.router.navigate(['/inicial']);
      return;
    }

    if (!alimentoId) {
      console.error('[onToggleFavorito] Alimento sem id válido:', alimento);
      return;
    }

    // Prevent duplicate requests for same alimento
    if (this.loadingFavorito[alimentoId]) {
      console.warn(`[onToggleFavorito] Já está carregando, ignorando...`);
      return;
    }
    this.loadingFavorito[alimentoId] = true;

    if (this.isFavorito(alimentoId)) {
      // INVERTIDO: SE JÁ É FAVORITO -> ADICIONAR (POST)
      console.log(`[onToggleFavorito] (invertido) Chamando POST para adicionar favorito...`);
      this.favoritosService.adicionarFavorito(Number(this.usuarioId), Number(alimentoId)).subscribe({
        next: (novoFavorito) => {
          console.log('[onToggleFavorito] POST sucesso (invertido):', novoFavorito);
          const f = {
            ...novoFavorito,
            id: Number((novoFavorito as any).id),
            id_usuario: Number((novoFavorito as any).id_usuario),
            id_alimento: Number((novoFavorito as any).id_alimento)
          } as Favorito;
          // Add locally - NÃO CHAMAR carregarFavoritos()!
          this.favoritos.push(f);
          console.log('[onToggleFavorito] this.favoritos agora tem', this.favoritos.length, 'items');
          this.atualizarAlimentosFavoritos();
        },
        error: (err) => {
          console.error('[onToggleFavorito] Erro ao adicionar (invertido):', err);
          this.loadingFavorito[alimentoId] = false;
        },
        complete: () => {
          console.log('[onToggleFavorito] POST completado (invertido)');
          this.loadingFavorito[alimentoId] = false;
        }
      });
    } else {
      // INVERTIDO: SE NÃO É FAVORITO -> REMOVER (DELETE)
      const idFav = this.obterIdFavorito(alimentoId);
      if (!idFav) {
        console.warn('ID do favorito não encontrado para remover (invertido)');
        this.loadingFavorito[alimentoId] = false;
        return;
      }

      console.log(`[onToggleFavorito] (invertido) Removendo favorito ${idFav}...`);
      this.favoritosService.deletarFavorito(idFav).subscribe({
        next: () => {
          console.log('[onToggleFavorito] DELETE sucesso (invertido)');
          // remove locally - NÃO CHAMAR carregarFavoritos()!
          this.favoritos = this.favoritos.filter(f => f.id !== idFav);
          console.log('[onToggleFavorito] this.favoritos agora tem', this.favoritos.length, 'items');
          this.atualizarAlimentosFavoritos();
        },
        error: (err) => {
          console.error('[onToggleFavorito] Erro ao remover (invertido):', err);
          this.loadingFavorito[alimentoId] = false;
        },
        complete: () => {
          console.log('[onToggleFavorito] DELETE completado (invertido)');
          this.loadingFavorito[alimentoId] = false;
        }
      });
    }
  }

  // Prompt helper to suggest login or cadastro when action requires authentication
  solicitarLoginCadastro(): void {
    const entrar = confirm('Você precisa estar logado para usar essa funcionalidade.\n\nClique OK para entrar ou Cancel para se cadastrar.');
    if (entrar) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/cadastro']);
    }
  }

  deletarFavorito(id_favorito: number, nomeAlimento?: string): void {
    this.favoritosService.deletarFavorito(id_favorito).subscribe({
      next: () => {
        // Remover imediatamente do array local
        this.favoritos = this.favoritos.filter(f => f.id !== id_favorito);
        // Atualiza a exibição imediata quando estivermos no modo "Meus Favoritos"
        this.atualizarAlimentosFavoritos();
        console.log("Favorito removido. Total agora:", this.favoritos.length);
      },
      error: erro => {
        console.error("Erro ao deletar favorito:", erro);
      }
    });
  }

  isFavorito(id_alimento: number): boolean {
    const id = Number(id_alimento);
    // Tolerância: alguns objetos de favorito podem ter ids em campos diferentes
    const result = this.favoritos.some(f => {
      const favAlimentoId = Number((f as any).id_alimento ?? NaN);
      const favId = Number((f as any).id ?? NaN);
      return favAlimentoId === id || favId === id;
    });
    console.log(`[isFavorito] id_alimento=${id_alimento}, result=${result}, favoritos=[${this.favoritos.map(f => (f as any).id_alimento || f.id).join(',')}]`);
    return result;
  }

  obterIdFavorito(id_alimento: number): number | null {
    const id = Number(id_alimento);
    const favorito = this.favoritos.find(f => {
      const favAlimentoId = Number((f as any).id_alimento ?? NaN);
      const favId = Number((f as any).id ?? NaN);
      return favAlimentoId === id || favId === id;
    });
    return favorito ? Number(favorito.id) : null;
  }

  exibirFavoritos(): void {
    if (!this.usuarioId) {
      this.solicitarLoginCadastro();
      return;
    }

    this.modoFavoritos = true;
    this.tipoDieta = null;
    this.categoriaSelecionada = null;
    this.modoPesquisa = false;

    console.log('[exibirFavoritos] Modo favoritos ativado. Carregando do servidor...');

    // Incrementar request ID para ignorar respostas antigas
    const currentRequest = ++this.favoritosRequestId;
    
    // Fazer GET limpo do servidor
    this.favoritosService.listarFavoritos(this.usuarioId!).subscribe({
      next: (favoritosDoServidor) => {
        // Ignorar respostas antigas
        if (currentRequest !== this.favoritosRequestId) {
          console.log('[exibirFavoritos] Ignorando resposta antiga');
          return;
        }

        console.log('[exibirFavoritos] Recebido do servidor:', favoritosDoServidor.length, 'favoritos');

        // Atualizar array local com dados do servidor
        this.favoritos = favoritosDoServidor.map(f => ({
          ...f,
          id: Number((f as any).id),
          id_usuario: Number((f as any).id_usuario),
          id_alimento: Number((f as any).id_alimento)
        } as Favorito));

        console.log('[exibirFavoritos] this.favoritos agora tem', this.favoritos.length, 'items');

        // Converter para alimentos para exibição
        this.alimentosRecomendados = this.favoritos.map(f => ({
          id: f.id_alimento,
          nome: f.nome,
          intolerante_lactose: (f as any).intolerante_lactose,
          vegetariano: (f as any).vegetariano,
          vegano: (f as any).vegano,
          ovolacto: (f as any).ovolacto,
          intolerante_gluten: (f as any).intolerante_gluten,
          imagem: f.imagem,
          descricao: f.descricao,
          categoria: f.categoria
        } as Alimento));

        console.log('[exibirFavoritos] alimentosRecomendados agora tem', this.alimentosRecomendados.length, 'items');
        
        // Scroll para o topo do conteúdo (give browser a bit more time so header renders)
        setTimeout(() => this.scrollToTopContent(), 160);
      },
      error: (err) => {
        if (currentRequest !== this.favoritosRequestId) return;
        console.error('[exibirFavoritos] Erro ao carregar:', err);
      }
    });
  }

  sairFavoritos(): void {
    this.modoFavoritos = false;
    this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  converterFavoritoParaAlimento(favorito: Favorito): Alimento {
    return {
      id: favorito.id_alimento,
      nome: favorito.nome,
      imagem: favorito.imagem,
      descricao: favorito.descricao,
      vegetariano: favorito.vegetariano,
      vegano: favorito.vegano,
      ovolacto: favorito.ovolacto,
      intolerante_lactose: favorito.intolerante_lactose,
      intolerante_gluten: favorito.intolerante_gluten,
      categoria: favorito.categoria
    } as Alimento;
  }

  // Atualiza a lista exibida (`alimentosRecomendados`) com base no array `favoritos`
  private atualizarAlimentosFavoritos(): void {
    if (!this.modoFavoritos) return;
    this.alimentosRecomendados = this.favoritos.map(f => ({
      id: f.id_alimento,
      nome: f.nome,
      intolerante_lactose: (f as any).intolerante_lactose,
      vegetariano: (f as any).vegetariano,
      vegano: (f as any).vegano,
      ovolacto: (f as any).ovolacto,
      intolerante_gluten: (f as any).intolerante_gluten,
      imagem: f.imagem,
      descricao: f.descricao,
      categoria: f.categoria
    } as Alimento));
    setTimeout(() => this.scrollToTopContent(), 80);
  }

  sair(): void {
    // Perform logout, clear local UI state and remain on Principal (no user)
    this.auth.logout();
    this.toast.show('Você saiu da conta', 'info');

    // Clear user-specific state so the principal view shows as logged-out
    this.usuarioNome = null;
    this.usuarioId = null;
    this.favoritos = [];
    // Reset any view-specific modes (dieta, categoria, pesquisa, favoritos)
    this.modoFavoritos = false;
    this.modoPesquisa = false;
    this.tipoDieta = null;
    this.categoriaSelecionada = null;
    this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);

    // Ensure route is /principal (stay on main screen)
    this.router.navigate(['/principal']);
  }

 scrollTo(id: string) {
  // mark active section for navbar highlighting (do not change view modes here)
  try { this.activeSection = id; } catch {}

  // Perform smooth scroll only — no mode changes here. Callers should manage modes.
  const elemento = document.getElementById(id);
  if (!elemento) return;

  const navbar = document.querySelector('nav');
  const navbarHeight = navbar ? (navbar as HTMLElement).offsetHeight : 80;

  const posicaoTop = elemento.getBoundingClientRect().top + window.scrollY - navbarHeight;
  window.scrollTo({ top: posicaoTop, behavior: 'smooth' });
}

  // Wrapper used by navbar navigation: reset view modes and then scroll
  navigateTo(id: string) {
    try {
      // When using navbar links we want to leave special modes (pesquisa, dieta, favoritos)
      this.modoPesquisa = false;
      this.tipoDieta = null;
      this.categoriaSelecionada = null;
      this.modoFavoritos = false;
      // restore home recommendations
      this.alimentosRecomendados = this.todosAlimentos.slice(0, 6);
      // scroll to section and update navbar highlighting
      this.scrollTo(id);
    } catch (e) {}
  }



  rolar(elemento: HTMLElement, direcao: 'esquerda' | 'direita') {
    const largura = elemento.clientWidth;
    const scroll = direcao === 'direita' ? largura : -largura;
    elemento.scrollBy({ left: scroll, behavior: 'smooth' });
  }
}
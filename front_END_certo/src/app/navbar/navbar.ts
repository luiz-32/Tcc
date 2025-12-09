import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [CommonModule, FormsModule]
})
export class Navbar {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private router: Router, private cd: ChangeDetectorRef) {}
  ngOnInit(): void {
    // Listen for auth changes triggered by AuthService (logout/login)
    try {
      window.addEventListener('auth-change', () => this.refreshFromStorage());
    } catch (e) {}
    this.refreshFromStorage();
    try { window.addEventListener('section-change', this._onSectionChange); } catch (e) {}
  }

  ngOnDestroy(): void {
    try { window.removeEventListener('section-change', this._onSectionChange); } catch (e) {}
  }

  refreshFromStorage() {
    try {
      const name = localStorage.getItem('usuarioLogado');
      const id = Number(localStorage.getItem('usuarioId')) || null;
      this.usuarioNome = name;
      this.usuarioId = id;
    } catch (e) {}
  }
  @Input() usuarioNome: string | null = null;
  private _activeSection: string | null = null;
  @Input()
  set activeSection(v: string | null) {
    this._activeSection = v;
    try { this.cd.detectChanges(); } catch (e) {}
  }
  get activeSection(): string | null { return this._activeSection; }
  @Input() usuarioId: number | null = null;
  @Input() usuarioFoto: string | null = null;
  @Output() sairEvent = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() navigate = new EventEmitter<string>();
  @Output() favoritosEvent = new EventEmitter<void>();
  @Output() loginEvent = new EventEmitter<void>();
  @Output() cadastroEvent = new EventEmitter<void>();
  @Output() uploadPhoto = new EventEmitter<File>();
  @Output() changeName = new EventEmitter<string>();
  @Output() changePassword = new EventEmitter<{ oldPassword: string; newPassword: string }>();
  @Output() deleteAccount = new EventEmitter<string>();

  termo: string = '';

  get fotoUrl(): string | null {
    try {
      const cached = localStorage.getItem('usuarioFoto');
      const cachedId = Number(localStorage.getItem('usuarioFotoId')) || null;
      // prefer explicit Input, otherwise use cached only when owner matches current usuarioId
      const p = this.usuarioFoto || (this.usuarioId && cached && cachedId === this.usuarioId ? cached : null);
      if (!p) return null;
      if (p.startsWith('http://') || p.startsWith('https://')) return p;
      const prefix = 'http://localhost:3000';
      return p.startsWith('/') ? `${prefix}${p}` : `${prefix}/${p}`;
    } catch (e) {
      return null;
    }
  }

  // Profile tab local state
  @Output() openProfilePage = new EventEmitter<void>();
  perfilTab: 'perfil' | 'seguranca' | 'excluir' = 'perfil';
  novoNome: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  selectedFileName: string | null = null;

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.termo.trim() !== '') {
      this.search.emit(this.termo.trim());
    }
  }

  clearSearch(event: Event) {
    event.preventDefault();
    this.termo = '';
    // Emit empty string so PrincipalComponent will call sairPesquisa()
    this.search.emit('');
    try { this.searchInput.nativeElement.focus(); } catch {}
  }

  sair() {
    this.sairEvent.emit();
  }

  exibirFavoritos() {
    this.favoritosEvent.emit();
  }

  // apenas emite o ID da seção
  emitNavigate(event: Event, sectionId: string) {
    event.preventDefault();
    this.navigate.emit(sectionId);
  }

  handleProfileClick(event: Event) {
    // If not logged in, intercept and request login/signup
    if (!this.usuarioNome) {
      event.preventDefault();
      // Navigate to the Tela Inicial component when not authenticated
      this.router.navigate(['/inicial']);
      return;
    }
    // otherwise, let dropdown behave normally
  }

  // Handlers for profile tab actions
  pickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const f = input.files[0];
    this.selectedFileName = f.name;
    this.uploadPhoto.emit(f);
  }

  submitChangeName() {
    if (!this.novoNome || this.novoNome.trim().length < 2) return;
    this.changeName.emit(this.novoNome.trim());
  }

  submitChangePassword() {
    if (!this.oldPassword || !this.newPassword) return;
    if (this.newPassword !== this.confirmPassword) return;
    this.changePassword.emit({ oldPassword: this.oldPassword, newPassword: this.newPassword });
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  triggerDeleteAccount() {
    // Emit the deletion intent; parent should handle confirmation
    const senha = prompt('Confirme sua senha para excluir a conta:');
    if (!senha) return;
    this.deleteAccount.emit(senha);
  }

  triggerLogin() {
    this.loginEvent.emit();
  }

  triggerCadastro() {
    this.cadastroEvent.emit();
  }

  openPerfil() {
    this.openProfilePage.emit();
  }

  private _onSectionChange = (ev: any) => {
    try {
      const d = ev && ev.detail ? ev.detail : null;
      if (!d) return;
      try { this.applyActiveClass(String(d.mapped || '')); } catch (e) {}
      try { this.cd.detectChanges(); } catch (e) {}
    } catch (e) {}
  }

  private applyActiveClass(mapped: string) {
    try {
      const links = Array.from(document.querySelectorAll('.nav-link')) as HTMLElement[];
      for (const el of links) {
        try {
          const target = el.getAttribute('data-section') || '';
          if (target && mapped && target === mapped) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        } catch (e) {}
      }
    } catch (e) {}
  }
}

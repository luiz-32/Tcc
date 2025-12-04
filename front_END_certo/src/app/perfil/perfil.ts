import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  usuarioNome: string | null = null;
  usuarioId: number | null = null;
  email: string | null = null;

  novoNome: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  selectedFileName: string | null = null;

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    try {
      this.usuarioNome = localStorage.getItem('usuarioLogado');
      const id = localStorage.getItem('usuarioId');
      this.usuarioId = id ? Number(id) : null;
      this.email = localStorage.getItem('usuarioEmail') || null;
      this.novoNome = this.usuarioNome || '';
    } catch (e) {
      this.usuarioNome = null;
      this.usuarioId = null;
    }
  }

  pickFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const f = input.files[0];
    this.selectedFileName = f.name;
    // For now simulate upload
    this.toast.show('Foto enviada (simulada).', 'success');
  }

  changeName() {
    if (!this.novoNome || this.novoNome.trim().length < 2) {
      this.toast.show('Nome inválido.', 'error');
      return;
    }
    this.toast.show('Alterando nome...', 'info');
    this.auth.changeUsername(this.novoNome.trim()).then(success => {
      if (success) {
        this.usuarioNome = this.novoNome.trim();
        this.toast.show('Nome alterado com sucesso.', 'success');
      } else {
        this.toast.show('Falha ao alterar nome.', 'error');
      }
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.toast.show('Preencha as senhas.', 'error');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.show('As senhas não coincidem.', 'error');
      return;
    }
    this.toast.show('Alterando senha...', 'info');
    this.auth.changePassword(this.oldPassword, this.newPassword).then(success => {
      if (success) {
        this.toast.show('Senha alterada com sucesso.', 'success');
        this.oldPassword = this.newPassword = this.confirmPassword = '';
      } else {
        this.toast.show('Falha ao alterar senha.', 'error');
      }
    });
  }

  deleteAccount() {
    const senha = prompt('Confirme sua senha para excluir a conta:');
    if (!senha) return;
    this.toast.show('Excluindo conta...', 'info');
    this.auth.deleteUser(senha).then(success => {
      if (success) {
        this.toast.show('Conta excluída.', 'success');
        this.router.navigate(['/principal']);
      } else {
        this.toast.show('Falha ao excluir conta.', 'error');
      }
    });
  }
}

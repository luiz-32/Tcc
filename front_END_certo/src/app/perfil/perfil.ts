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
    this.toast.show('Enviando foto...', 'info');
    this.auth.uploadProfilePhoto(f).then((res: any) => {
      this.toast.show('Foto atualizada com sucesso.', 'success');
      if (res && res.foto_perfil) {
        localStorage.setItem('usuarioFoto', res.foto_perfil);
      }
    }).catch(err => {
      console.error('Erro ao enviar foto de perfil', err);
      this.toast.show('Falha ao enviar foto.', 'error');
    });
  }

  changeName() {
    // Save both name and email using updateProfile
    const payload: any = {};
    if (this.novoNome && this.novoNome.trim().length >= 2) payload.nome_usuario = this.novoNome.trim();
    if (this.email && this.email.trim().length > 3) payload.email = this.email.trim();

    if (!payload.nome_usuario && !payload.email) {
      this.toast.show('Nada para atualizar.', 'error');
      return;
    }

    this.toast.show('Salvando perfil...', 'info');
    this.auth.updateProfile(payload).then(res => {
      this.usuarioNome = res?.nome_usuario || this.usuarioNome;
      this.email = res?.email || this.email;
      this.toast.show('Perfil atualizado com sucesso.', 'success');
      alert('Perfil atualizado com sucesso.');
    }).catch(err => {
      console.error('Erro updateProfile', err);
      this.toast.show('Falha ao atualizar perfil.', 'error');
      alert('Falha ao atualizar perfil. Verifique o console.');
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

import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(response: any): void {
    if (!this.isBrowser()) return;

    console.log("Resposta do login:", response);
    
    if (response && response.token) {
      localStorage.setItem('token', response.token);

      const nome = response.nome_usuario ||
                    response.nome ||
                    response.usuario?.nome_usuario ||
                    response.user?.nome_usuario ||
                    response.user?.nome;

      const id = response.id || response.user?.id;

      if (nome) {
        localStorage.setItem('usuarioLogado', nome);
        console.log("Usuário salvo no localStorage:", nome);
      } else {
        console.warn("⚠️ Nenhum nome de usuário encontrado na resposta.");
      }

      if (id) {
        localStorage.setItem('usuarioId', String(id));
        console.log("ID do usuário salvo no localStorage:", id);
      } else {
        console.warn("⚠️ Nenhum ID de usuário encontrado na resposta.");
      }
    }
  }

  estaLogado(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('token');
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('usuarioId');
  }

  deleteUser(password: string): Promise<boolean> {
    if (!this.isBrowser()) return Promise.resolve(false);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.5;
        if (success) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioLogado');
          localStorage.removeItem('usuarioId');
        }
        resolve(success);
      }, 1000);
    });
  }

  changeUsername(newUsername: string): Promise<boolean> {
    if (!this.isBrowser()) return Promise.resolve(false);

    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.5;
        if (success) {
          localStorage.setItem('usuarioLogado', newUsername);
        }
        resolve(success);
      }, 1000);
    });
  }

  changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    console.log('Executando changePassword');
    return new Promise((resolve) => {
      setTimeout(() => resolve(Math.random() > 0.5), 1000);
    });
  }
}

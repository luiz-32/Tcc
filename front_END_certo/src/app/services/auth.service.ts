import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}
  

  login(response: any): void {
    console.log("Resposta do login:", response);
    if (response && response.token) {
      localStorage.setItem('token', response.token);
      const nome = response.nome_usuario || response.nome || response.usuario?.nome_usuario || response.user?.nome_usuario || response.user?.nome;
      if (nome) {
        localStorage.setItem('usuarioLogado', nome);
        console.log("Usuário salvo no localStorage:", nome);
      } else {
        console.warn("⚠️ Nenhum nome de usuário encontrado na resposta.");
      }
    }
  }

  estaLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
  }

  deleteUser(password: string): Promise<boolean> {
    console.log('Executando deleteUser com password:', password);  // Log para depuração
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.5;  // Simulação de sucesso
        if (success) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuarioLogado');
        }
        resolve(success);
      }, 1000);
    });
  }

  changeUsername(newUsername: string): Promise<boolean> {
    console.log('Executando changeUsername com newUsername:', newUsername);
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
    console.log('Executando changePassword com oldPassword:', oldPassword, 'e newPassword:', newPassword);
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.5;
        resolve(success);
      }, 1000);
    });
  }
}
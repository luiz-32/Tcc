// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  login(response: any): void {
    console.log("Resposta do login:", response); // 👀 Veja o que vem do backend

    if (response && response.token) {
      localStorage.setItem('token', response.token);

      // Captura o nome do usuário com segurança
      const nome =
        response.nome_usuario ||
        response.nome ||
        response.usuario?.nome_usuario ||
        response.user?.nome_usuario ||
        response.user?.nome;

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
}

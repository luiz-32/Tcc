// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Método que o erro está reclamando
  login(response: any): void {
    if (response && response.token) {
      // Salva o token e outras informações no localStorage
      localStorage.setItem('token', response.token);
      
      // Você pode salvar outras informações, como o ID do usuário
      // if (response.user_id) {
      //   localStorage.setItem('user_id', response.user_id);
      // }
    }
  }

  // Seu método estaLogado() já deve existir aqui
  estaLogado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Opcional: método de logout para remover o token
  logout(): void {
    localStorage.removeItem('token');
  }
}
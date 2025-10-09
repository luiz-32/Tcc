// src/app/usuario/usuario.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class UsuarioComponent {
  nome_usuario: string = '';
  senha: string = '';
  mensagem: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  fazerCadastro() {
    // Validações no TS
    if (!this.nome_usuario || this.nome_usuario.length < 3) {
      this.mensagem = 'Nome de usuário deve ter pelo menos 3 caracteres';
      return;
    }

    if (!this.senha || this.senha.length < 4) {
      this.mensagem = 'A senha deve ter pelo menos 4 caracteres';
      return;
    }

    // Envia para o backend (POST /usuario)
    this.http.post<any>('http://localhost:3000/usuario', {
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        console.log('Cadastro bem-sucedido:', res); // Para depuração
        this.mensagem = 'Cadastro realizado com sucesso! Faça login agora.';
        // Limpa os campos após sucesso
        this.nome_usuario = '';
        this.senha = '';
        // Redireciona para login após 2 segundos (para o usuário ver a mensagem)
        setTimeout(() => this.router.navigate(['/principal']), 2000);
      },
      error: (err) => {
        this.mensagem = err.error?.erro || 'Erro ao cadastrar. Tente novamente.';
        console.error('Erro no cadastro:', err); // Para depuração
      }
    });
  }
}
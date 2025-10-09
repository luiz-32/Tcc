// src/app/login/login.component.ts (exemplo atualizado)

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importe se não tiver
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // Assuma que você tem

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  nome_usuario: string = '';
  senha: string = '';
  mensagem: string = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService, // Se usar para login/redirecionamento
    private router: Router // Necessário para a seta e links
  ) {}

  fazerLogin() {
    // Validações extras no TS (opcional, complementa o HTML)
    // POST para backend (/login, como no seu código)
    this.http.post<any>('http://localhost:3000/login', {
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        this.auth.login(res); // Salva token e user no localStorage (via AuthService)
        this.mensagem = ''; // Limpa mensagem de erro anterior
        this.router.navigate(['/principal']); // Redireciona após sucesso
      },
      error: (err) => {
        this.mensagem = err.error?.erro || 'Credenciais inválidas'; // Exibe erro do backend
        console.error('Erro no login:', err);
      }
    });
  }
}

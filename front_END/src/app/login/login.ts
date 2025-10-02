import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

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
    private auth: AuthService,
    private router: Router
  ) {}

  fazerLogin() {
    // CORRIGIDO: A URL da API deve incluir o caminho '/usuario'
    this.http.post<any>('http://localhost:3000/login', {
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        if (res && res.user && res.token) {
          // salva no localStorage (usuário + token)
          this.auth.login(res);

          // redireciona para a tela principal
          this.router.navigate(['/principal']);
        } else {
          this.mensagem = 'Credenciais inválidas';
        }
      },
      error: (err) => {
        this.mensagem = err.error?.erro || 'Erro ao tentar logar';
      }
    });
  }
}
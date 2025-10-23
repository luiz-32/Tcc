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
    this.http.post<any>('http://localhost:3000/login', {
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        this.auth.login(res);
        this.mensagem = '';
        this.router.navigate(['/principal']);
      },
      error: (err) => {
        this.mensagem = err.error?.erro || 'Credenciais inválidas';
        console.error('Erro no login:', err);
      }
    });
  }
}

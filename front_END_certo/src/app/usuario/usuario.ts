import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // ⬅️ Import do serviço de autenticação

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
    private router: Router,
    private auth: AuthService // ⬅️ Injetando o AuthService
  ) {}

  ngOnInit(){
    console.log("Funcionando");
    if(this.auth.estaLogado()){
      this.router.navigate(['/principal']);
    }
  }

  fazerCadastro() {
    if (!this.nome_usuario || !this.senha) {
      this.mensagem = 'Preencha todos os campos!';
      return;
    }

    // Envia os dados para o backend
    this.http.post<any>('http://localhost:3000/usuario', {
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        console.log('✅ Cadastro bem-sucedido:', res);
        this.mensagem = 'Cadastro realizado com sucesso! Redirecionando...';

        // Salva no localStorage (simulando login automático)
        const usuario = res.nome_usuario || this.nome_usuario;
        const tokenFake = res.token || 'cadastroTokenFake'; // Caso o backend ainda não gere token
        this.auth.login({ token: tokenFake, nome_usuario: usuario });

        // Redireciona para a tela principal após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/principal']);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Erro no cadastro:', err);
        this.mensagem = err.error?.erro || 'Erro ao cadastrar. Tente novamente.';
      }
    });
  }
}

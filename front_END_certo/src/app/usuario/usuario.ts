import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // ⬅️ Import do serviço de autenticação
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css']
})
export class UsuarioComponent {
  email: string = '';
  nome_usuario: string = '';
  senha: string = '';
  mensagem: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService, // ⬅️ Injetando o AuthService
    private toast: ToastService
  ) {}


  ngOnInit(){
    console.log("Funcionando");
    // Only redirect to principal if we have an authenticated user stored
    if(this.auth.estaLogado() && localStorage.getItem('usuarioLogado') && localStorage.getItem('usuarioId')){
      this.router.navigate(['/principal']);
    }
  }

  fazerCadastro() {
    if (!this.email || !this.nome_usuario || !this.senha) {
      this.mensagem = 'Preencha todos os campos!';
      return;
    }

    // Envia os dados para o backend
    this.http.post<any>('http://localhost:3000/usuario', {
      email: this.email,
      nome_usuario: this.nome_usuario,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        console.log('✅ Cadastro bem-sucedido:', res);
        this.mensagem = 'Cadastro realizado com sucesso! Redirecionando...';

        // Salva no localStorage (simulando login automático)
        const usuario = res.nome_usuario || this.nome_usuario;
        const tokenFake = res.token || 'cadastroTokenFake'; // Caso o backend ainda não gere token
        // Se o backend retornou o id do usuário, inclua-o para que o AuthService salve `usuarioId`
        const payload: any = { token: tokenFake, nome_usuario: usuario };
        if (res.id) payload.id = res.id;
        if (res.user && res.user.id) payload.user = res.user;
        this.auth.login(payload);
        this.toast.show('Cadastro realizado com sucesso', 'success');

        // Notify user and redirect
        alert('Cadastro realizado com sucesso');
        setTimeout(() => {
          this.router.navigate(['/principal']);
        }, 1000);
      },
      error: (err) => {
        console.error('❌ Erro no cadastro:', err);
        this.mensagem = err.error?.erro || 'Erro ao cadastrar. Tente novamente.';
        alert('Falha no cadastro: ' + (this.mensagem || 'ver console'));
      }
    });
  }
}

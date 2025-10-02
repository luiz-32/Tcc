   import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http'; // Adicionei HttpErrorResponse
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Interface para representar um usuário
interface Usuario {
  id?: number; // opcional
  nome_usuario: string;
  senha: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.css'],
})
export class UsuarioComponent implements OnInit {
  usuarios: Usuario[] = [];
  novoUsuario: Usuario = { nome_usuario: '', senha: '' };
  mensagem: string = '';
  tipoMensagem: 'success' | 'danger' | 'warning' | 'info' = 'success';
  loading: boolean = false; // Adicionei para mostrar loading durante o POST

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.buscarUsuarios();
  }

  // GET - buscar todos
  buscarUsuarios() {
    this.http
      .get<Usuario[]>('http://localhost:3000/usuario')
      .subscribe({
        next: (res) => {
          this.usuarios = res;
          console.log('Usuários carregados:', res); // Debug: veja no console
        },
        error: (err) => {
          console.error('Erro ao buscar usuários:', err); // Debug
          this.exibirMensagem('Erro ao carregar usuários.', 'danger');
        }
      });
  }

  // POST - cadastrar novo + login automático
  adicionarUsuario() {
    const nomeTrim = this.novoUsuario.nome_usuario.trim();
    const senhaTrim = this.novoUsuario.senha.trim();

    
    
    console.log('Validação - Nome length:', nomeTrim.length, 'Senha length:', senhaTrim.length); // Debug validação
    
    if (!nomeTrim || !senhaTrim) {
      this.exibirMensagem('Nome de usuário e senha são obrigatórios.', 'warning');
      return;
    }

    this.novoUsuario.nome_usuario = nomeTrim; // Limpa espaços
    this.novoUsuario.senha = senhaTrim;
    
    this.loading = true;
    console.log('Payload final:', this.novoUsuario); // Debug final

    this.http
      .post<Usuario>('http://localhost:3000/usuario', this.novoUsuario, {
        headers: { 'Content-Type': 'application/json' }
      })
      .subscribe({
        next: (res) => {
          console.log('POST sucesso - Response:', res);
          this.exibirMensagem('Usuário cadastrado com sucesso!', 'success');
          this.loading = false;
          this.novoUsuario = { nome_usuario: '', senha: '' }; // Limpa form
          
          
          try {
             this.auth.login(res);
             console.log('Login automático realizado.');
           } catch (loginErr) {
             console.error('Erro no login automático:', loginErr);
           }
           setTimeout(() => {
             this.router.navigate(['/principal']);
           }, 2000);
        },
        error: (err: HttpErrorResponse) => {
          console.error('POST erro completo:', err.status, err.error, err.message);
          this.loading = false;
          let msgErro = 'Erro ao cadastrar usuário.';
          if (err.status === 409 || err.status === 400) {
            msgErro = 'Nome de usuário já existe. Escolha outro!';
          } else if (err.status === 404) {
            msgErro = 'Rota não encontrada. Verifique o backend.';
          } else if (err.status === 500) {
            msgErro = 'Erro no servidor. Verifique os logs do backend.';
          } else if (err.status === 0) {
            msgErro = 'Erro de conexão/CORS. Verifique o servidor.';
          } else {
            msgErro = `Erro ao cadastrar: ${err.message || 'Tente novamente.'}`;
          }
          this.exibirMensagem(msgErro, 'danger');
        },
      });
  }

  // Exibir mensagem temporária
  exibirMensagem(
    texto: string,
    tipo: 'success' | 'danger' | 'warning' | 'info' = 'success'
  ) {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => (this.mensagem = ''), 3000);
  }
}

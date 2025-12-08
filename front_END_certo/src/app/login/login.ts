import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  senha: string = '';
  mensagem: string = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(){
    console.log("Funcionando");
    // Only redirect to principal if we have an authenticated user stored
    if(this.auth.estaLogado() && localStorage.getItem('usuarioLogado') && localStorage.getItem('usuarioId')){
      this.router.navigate(['/principal']);
    }
  }

  fazerLogin() {
    this.http.post<any>('http://localhost:3000/login', {
      email: this.email,
      senha: this.senha
    }).subscribe({
      next: (res) => {
        this.auth.login(res);
        this.mensagem = '';
        this.toast.show('Login efetuado com sucesso', 'success');
        alert('Login efetuado com sucesso');
        this.router.navigate(['/principal']);
      },
      error: (err) => {
        this.mensagem = err.error?.erro || 'Credenciais inválidas';
        console.warn('Usuário não encontrado, tentando login de administrador...', err && err.status);

        // Try admin login as fallback
        this.http.post<any>('http://localhost:3000/admin/login', {
          email: this.email,
          senha: this.senha
        }).subscribe({
          next: (adminRes) => {
            this.auth.login(adminRes);
            this.toast.show('Login administrador efetuado', 'success');
            alert('Login administrador efetuado');
            this.router.navigate(['/admin']);
          },
          error: (adminErr) => {
            this.mensagem = adminErr.error?.erro || this.mensagem || 'Credenciais inválidas';
            alert('Falha no login: ' + (this.mensagem || 'Ver console'));
            console.error('Erro no login:', adminErr);
          }
        });
      }
    });
  }
}

// src/app/principal/principal.component.ts
import { Component, OnInit } from '@angular/core'; 
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { CommonModule } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router'; 

interface Usuario { 
  id: number; 
  nome_usuario: string; 
  senha?: string; 
  avatar?: string; 
} 

@Component({ 
  selector: 'app-principal', 
  standalone: true, 
  imports: [CommonModule, HttpClientModule, RouterModule], 
  templateUrl: './principal.html', 
  styleUrls: ['./principal.css'], 
}) 
export class PrincipalComponent implements OnInit { 
  usuarios: Usuario[] = []; 
  usuarioLogado?: Usuario; 

  constructor(private http: HttpClient, private router: Router) {} 

  ngOnInit() { 
    this.buscarUsuarios(); 
    
    // exemplo: pegar id do usuário logado do localStorage 
    const userId = localStorage.getItem('userId'); 
    if (userId) { 
      this.buscarUsuarioPorId(Number(userId)); 
    }
  } 

  buscarUsuarios() { 
    this.http.get<Usuario[]>('http://localhost:3000/usuario') 
      .subscribe((res) => (this.usuarios = res)); 
  } 

  buscarUsuarioPorId(id: number) {
    this.http.get<Usuario>(`http://localhost:3000/usuario/${id}`)
      .subscribe(res => {
        console.log('Usuario logado:', res);
        this.usuarioLogado = res;
      });
  }

  adicionarUsuario() { 
    this.router.navigate(['/personalize']); 
  }
       
  editarUsuario() {
    if (this.usuarioLogado) { 
      this.router.navigate(['/editar', this.usuarioLogado.id]); 
    }
  } 
}

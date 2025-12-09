import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent {
  alimentos: any[] = [];
  categorias: any[] = [];

  // Form model for new alimento
  novo = { nome: '', descricao: '', imagem: '', vegetariano: false, vegano: false, ovolacto: false, intolerante_lactose: false, intolerante_gluten: false, id_categoria: null };

  // UI: collapse state for panels
  showAlimentos: boolean = true;
  editingId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService, private router: Router, private toast: ToastService) {}

  // File upload handling
  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.uploadImage(file);
  }

  uploadImage(file: File) {
    const fd = new FormData();
    fd.append('imagem', file);

    this.http.post<any>('http://localhost:3000/upload', fd).subscribe({
      next: res => {
        // backend returns { message, path }
        const path = res && (res.path || res.pathFile || res.filePath || res.file && res.file.path);
        if (path) {
          // normalize backslashes to forward slashes
          this.novo.imagem = String(path).replace(/\\/g, '/');
          this.toast.show('Imagem enviada com sucesso', 'success');
        } else if (res && res.message) {
          this.toast.show('Upload concluído', 'success');
        } else {
          this.toast.show('Upload concluído (resposta sem path)', 'info');
        }
      },
      error: err => {
        console.error('Erro ao enviar imagem', err);
        this.toast.show('Falha no upload', 'error');
      }
    });
  }

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      console.warn('Acesso admin sem permissão');
      return;
    }
    this.carregarAlimentos();
    this.carregarCategorias();
  }

  carregarAlimentos() {
    this.http.get<any[]>('http://localhost:3000/admin/alimentos').subscribe({
      next: res => this.alimentos = res,
      error: err => console.error('Erro ao carregar alimentos', err)
    });
  }

  carregarCategorias() {
    this.http.get<any[]>('http://localhost:3000/alimentos/categorias').subscribe({
      next: res => this.categorias = res,
      error: err => console.error('Erro ao carregar categorias', err)
    });
  }

  toggleAlimentos() {
    this.showAlimentos = !this.showAlimentos;
  }

  criarAlimento() {
    if (this.editingId) {
      // Update
      this.http.put<any>(`http://localhost:3000/admin/alimentos/${this.editingId}`, this.novo).subscribe({
        next: res => {
          alert('Alimento atualizado');
          this.editingId = null;
          this.novo = { nome: '', descricao: '', imagem: '', vegetariano: false, vegano: false, ovolacto: false, intolerante_lactose: false, intolerante_gluten: false, id_categoria: null };
          this.carregarAlimentos();
        },
        error: err => {
          console.error('Erro ao atualizar alimento', err);
          alert('Erro ao atualizar alimento');
        }
      });
    } else {
      // Create
      this.http.post<any>('http://localhost:3000/admin/alimentos', this.novo).subscribe({
        next: res => {
          alert('Alimento criado');
          this.novo = { nome: '', descricao: '', imagem: '', vegetariano: false, vegano: false, ovolacto: false, intolerante_lactose: false, intolerante_gluten: false, id_categoria: null };
          this.carregarAlimentos();
        },
        error: err => {
          console.error('Erro ao criar alimento', err);
          alert('Erro ao criar alimento');
        }
      });
    }
  }

  editAlimento(a: any) {
    this.editingId = a.id;
    this.novo = {
      nome: a.nome || '',
      descricao: a.descricao || '',
      imagem: a.imagem || '',
      vegetariano: !!a.vegetariano,
      vegano: !!a.vegano,
      ovolacto: !!a.ovolacto,
      intolerante_lactose: !!a.intolerante_lactose,
      intolerante_gluten: !!a.intolerante_gluten,
      id_categoria: a.id_categoria || null
    };
    // scroll to form (if needed)
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  }

  deleteAlimento(id: number) {
    if (!confirm('Confirma exclusão deste alimento?')) return;
    this.http.delete<any>(`http://localhost:3000/admin/alimentos/${id}`).subscribe({
      next: res => {
        alert('Alimento deletado');
        this.carregarAlimentos();
      },
      error: err => {
        console.error('Erro ao deletar alimento', err);
        alert('Erro ao deletar alimento');
      }
    });
  }

  logoutAdmin() {
    this.auth.logout();
    this.toast.show('Deslogado do painel de administrador', 'info');
    // Redirect to principal page
    this.router.navigate(['/principal']);
  }
}

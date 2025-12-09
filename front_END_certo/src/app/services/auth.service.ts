import { Injectable, Inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(response: any): void {
    if (!this.isBrowser()) return;

    console.log("Resposta do login:", response);
    
    if (response && response.token) {
      localStorage.setItem('token', response.token);

      const nome = response.nome_usuario ||
                    response.nome ||
                    response.usuario?.nome_usuario ||
                    response.user?.nome_usuario ||
                    response.user?.nome;

      const id = response.id || response.user?.id;

      if (nome) {
        localStorage.setItem('usuarioLogado', nome);
        console.log("Usuário salvo no localStorage:", nome);
      } else {
        console.warn("⚠️ Nenhum nome de usuário encontrado na resposta.");
      }

      if (id) {
        localStorage.setItem('usuarioId', String(id));
        // Clear any stale photo before retrieving the current user's profile
        localStorage.removeItem('usuarioFoto');
        localStorage.removeItem('usuarioFotoId');
        localStorage.removeItem('usuarioEmail');
        // Fetch profile once. getProfile now guards against races.
        this.getProfile().then(() => {
          try { window.dispatchEvent(new Event('auth-change')); } catch (e) {}
        }).catch(() => {});
      } else {
        console.warn("⚠️ Nenhum ID de usuário encontrado na resposta.");
      }

      // If response indicates admin, store flag
      if (response.admin) {
        localStorage.setItem('isAdmin', '1');
      } else {
        localStorage.removeItem('isAdmin');
      }
    }
  }

  estaLogado(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('token');
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('usuarioFoto');
    localStorage.removeItem('usuarioFotoId');
    localStorage.removeItem('usuarioEmail');
    try { window.dispatchEvent(new Event('auth-change')); } catch (e) {}
  }

  isAdmin(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem('isAdmin') === '1';
  }
  deleteUser(password: string): Promise<boolean> {
    if (!this.isBrowser()) return Promise.resolve(false);

    const id = Number(localStorage.getItem('usuarioId')) || null;
    if (!id) return Promise.resolve(false);

    return lastValueFrom(this.http.delete(`${this.apiUrl}/usuario/${id}`, { body: { senha: password } })).then((res: any) => {
      // On success, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('usuarioLogado');
      localStorage.removeItem('usuarioId');
      localStorage.removeItem('usuarioFoto');
      localStorage.removeItem('usuarioFotoId');
      localStorage.removeItem('usuarioEmail');
      return true;
    }).catch(err => {
      console.error('deleteUser error', err);
      return false;
    });
  }

  changeUsername(newUsername: string): Promise<boolean> {
    if (!this.isBrowser()) return Promise.resolve(false);
    const id = Number(localStorage.getItem('usuarioId')) || null;
    if (!id) return Promise.resolve(false);

    return lastValueFrom(this.http.put(`${this.apiUrl}/usuario/${id}`, { nome_usuario: newUsername })).then((res: any) => {
      // Update localStorage on success
      if (res && (res.nome_usuario || res.nome)) {
        localStorage.setItem('usuarioLogado', res.nome_usuario || res.nome);
      } else {
        localStorage.setItem('usuarioLogado', newUsername);
      }
      return true;
    }).catch(err => {
      console.error('changeUsername error', err);
      return false;
    });
  }

  changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    if (!this.isBrowser()) return Promise.resolve(false);
    const id = Number(localStorage.getItem('usuarioId')) || null;
    if (!id) return Promise.resolve(false);

    return lastValueFrom(this.http.put(`${this.apiUrl}/usuario/${id}`, { senha_atual: oldPassword, nova_senha: newPassword })).then(res => {
      return true;
    }).catch(err => {
      console.error('changePassword error', err);
      return false;
    });
  }

  updateProfile(data: { nome_usuario?: string; email?: string }): Promise<any> {
    if (!this.isBrowser()) return Promise.resolve(false);
    const id = Number(localStorage.getItem('usuarioId')) || null;
    if (!id) return Promise.resolve(false);

    return lastValueFrom(this.http.put(`${this.apiUrl}/usuario/${id}`, data)).then((res: any) => {
      if (res) {
        if (res.nome_usuario) {
          localStorage.setItem('usuarioLogado', res.nome_usuario);
        }
        if (res.email) {
          localStorage.setItem('usuarioEmail', res.email);
        }
      }
      return res;
    }).catch(err => {
      console.error('updateProfile error', err);
      throw err;
    });
  }

  getProfile(): Promise<any> {
    if (!this.isBrowser()) return Promise.resolve(null);
    const requestedId = Number(localStorage.getItem('usuarioId')) || null;
    if (!requestedId) return Promise.resolve(null);
    return lastValueFrom(this.http.get(`${this.apiUrl}/usuario/${requestedId}`)).then((res: any) => {
      try {
        // Only set the foto if the same user is still logged in (avoid race where logout/login happened)
        const currentId = Number(localStorage.getItem('usuarioId')) || null;
        if (res && res.foto_perfil && currentId === requestedId) {
          localStorage.setItem('usuarioFoto', res.foto_perfil);
          localStorage.setItem('usuarioFotoId', String(requestedId));
        }
        // store email and username as well to keep localStorage in sync
        if (res && currentId === requestedId) {
          if (res.email) localStorage.setItem('usuarioEmail', res.email);
          if (res.nome_usuario || res.nome) localStorage.setItem('usuarioLogado', res.nome_usuario || res.nome);
        }
      } catch (e) {}
      return res;
    }).catch(err => {
      console.error('getProfile error', err);
      throw err;
    });
  }

  uploadProfilePhoto(file: File): Promise<any> {
    if (!this.isBrowser()) return Promise.resolve(null);
    const requestedId = Number(localStorage.getItem('usuarioId')) || null;
    if (!requestedId) return Promise.resolve(null);

    const fd = new FormData();
    fd.append('foto_perfil', file);

    return lastValueFrom(this.http.post(`${this.apiUrl}/usuario/${requestedId}/foto`, fd)).then((res: any) => {
      try {
        const currentId = Number(localStorage.getItem('usuarioId')) || null;
        if (res && res.foto_perfil && currentId === requestedId) {
          // Normalize and store URL for client (prefixed later when displaying)
          localStorage.setItem('usuarioFoto', res.foto_perfil);
          localStorage.setItem('usuarioFotoId', String(requestedId));
        }
      } catch (e) {}
      return res;
    }).catch(err => {
      console.error('uploadProfilePhoto error', err);
      throw err;
    });
  }

  deleteProfilePhoto(): Promise<any> {
    if (!this.isBrowser()) return Promise.resolve(null);
    const id = Number(localStorage.getItem('usuarioId')) || null;
    if (!id) return Promise.resolve(null);

    return lastValueFrom(this.http.delete(`${this.apiUrl}/usuario/${id}/foto`)).then((res: any) => {
      localStorage.removeItem('usuarioFoto');
      localStorage.removeItem('usuarioFotoId');
      return res;
    }).catch(err => {
      console.error('deleteProfilePhoto error', err);
      throw err;
    });
  }
}

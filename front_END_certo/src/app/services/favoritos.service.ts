import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alimento } from './alimentos.service';

export interface Favorito {
  id: number;
  id_usuario: number;
  id_alimento: number;
  nome: string;
  imagem: string;
  descricao: string;
  vegetariano: boolean;
  vegano: boolean;
  ovolacto: boolean;
  intolerante_lactose: boolean;
  intolerante_gluten: boolean;
  id_categoria: number;
  categoria: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  private apiUrl = 'http://localhost:3000/favoritos';

  constructor(private http: HttpClient) {}

  // Adicionar um alimento aos favoritos
  adicionarFavorito(id_usuario: number, id_alimento: number): Observable<Favorito> {
    return this.http.post<Favorito>(this.apiUrl, { id_usuario, id_alimento });
  }

  // Listar todos os favoritos do usuário
  listarFavoritos(id_usuario: number): Observable<Favorito[]> {
    return this.http.get<Favorito[]>(`${this.apiUrl}/${id_usuario}`);
  }

  // Deletar um favorito
  deletarFavorito(id_favorito: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id_favorito}`);
  }

  // Verificar se um alimento é favorito
  verificarFavorito(id_usuario: number, id_alimento: number): Observable<{ isFavorito: boolean; id_favorito: number | null }> {
    return this.http.get<{ isFavorito: boolean; id_favorito: number | null }>(`${this.apiUrl}/check/${id_usuario}/${id_alimento}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modelo principal do alimento
export interface Alimento {
  id: number;
  nome: string;
  intolerante_lactose: boolean;
  vegetariano: boolean;
  vegano: boolean;
  ovolacto: boolean;
  intolerante_gluten: boolean;
  imagem: string;
  descricao: string;
}

// Modelo para descrição (tabela "descricao")
export interface DescricaoAlimento {
  id: number;
  descricao: string;
  beneficios?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlimentosService {
  private apiUrl = 'http://localhost:3000/alimentos';
  private descricaoUrl = 'http://localhost:3000/descricao'; // rota para descrição

  constructor(private http: HttpClient) {}

  // Busca todos os alimentos
  getAlimentos(): Observable<Alimento[]> {
    return this.http.get<Alimento[]>(this.apiUrl);
  }

  // Busca descrição pelo ID do alimento
  getDescricaoPorId(id: number): Observable<DescricaoAlimento> {
    return this.http.get<DescricaoAlimento>(`${this.descricaoUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definindo o modelo de alimento (ajuste conforme sua estrutura de dados)
export interface Alimento {
  id: number;
  nome: string;
  intolerante_lactose: boolean;
  vegetariano: boolean;
  vegano: boolean;
  ovolactovegetariano: boolean;
  imagem: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlimentosService {
  private apiUrl = 'http://localhost:3000/alimentos'; // URL da sua API

  constructor(private http: HttpClient) {}

  // Método GET para buscar todos os alimentos
  getAlimentos(): Observable<Alimento[]> {
    return this.http.get<Alimento[]>(this.apiUrl);
  }
}

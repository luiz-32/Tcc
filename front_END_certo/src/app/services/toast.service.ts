import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  timeout: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  show(text: string, type: ToastType = 'info', timeout = 3500) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, text, type, timeout };
    const current = this.toastsSubject.value.slice();
    current.push(toast);
    this.toastsSubject.next(current);

    setTimeout(() => this.remove(id), timeout);
  }

  remove(id: number) {
    const list = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(list);
  }
}

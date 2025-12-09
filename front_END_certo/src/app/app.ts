import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './toast/toast';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('front_END');

  constructor(private toast: ToastService) {}

  ngOnInit(): void {
    // quick startup test to verify toasts render (remove after verification)
    try { this.toast.show('Toasts ativados — teste', 'info', 2500); } catch (e) {}
  }
}

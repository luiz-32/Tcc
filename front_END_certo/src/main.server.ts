import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// 👉 Clona a config existente e adiciona o HttpClientModule
const bootstrap = () => bootstrapApplication(App, {
  ...config,
  providers: [
    ...(config.providers || []),
    importProvidersFrom(HttpClientModule) // 👈 ESSENCIAL PRA RESOLVER O ERRO
  ]
});

export default bootstrap;

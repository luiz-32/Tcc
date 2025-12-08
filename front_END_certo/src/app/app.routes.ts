import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth-guard';
import { UsuarioComponent } from './usuario/usuario';
import { TelaInicial } from './tela-inicial/tela-inicial';
import { PrincipalComponent } from './principal/principal';
import { PerfilComponent } from './perfil/perfil';
import { AdminComponent } from './admin/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'principal', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inicial', component:TelaInicial },
  { path: 'cadastro', component: UsuarioComponent },
  { path: 'principal', component: PrincipalComponent },
  { path: 'perfil', component: PerfilComponent }
  ,{ path: 'admin', component: AdminComponent }
];

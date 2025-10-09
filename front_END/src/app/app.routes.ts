import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AuthGuard } from './guards/auth-guard';
import { UsuarioComponent } from './usuario/usuario';
import { TelaInicial } from './tela-inicial/tela-inicial';
import { PrincipalComponent } from './principal/principal';
import { PersonalizeComponent} from './personalize/personalize';

export const routes: Routes = [
  { path: '', redirectTo: 'inicial', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inicial', component:TelaInicial },
  { path: 'cadastro', component: UsuarioComponent },
  { path: 'personalize', component: PersonalizeComponent },
  { path: 'principal', component: PrincipalComponent, canActivate: [AuthGuard]}
];

// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateComponent } from './components/form/create/create.component';
import { ResultsComponent } from './components/form/results/results.component';
import { ResponseComponent } from './components/response/response.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { authGuard } from './guards/auth.guard'; // <-- IMPORTA EL GUARDIÁN

export const routes: Routes = [
  // --- Rutas Públicas (SIN guardián) ---
  { path: '', component: WelcomeComponent },
  { path: 'response/:token', component: ResponseComponent }, // Esta es pública, cualquiera puede responder

  // --- Rutas Protegidas (CON el guardián) ---
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // <-- APLICA EL GUARDIÁN AQUÍ
  },
  {
    path: 'create',
    component: CreateComponent,
    canActivate: [authGuard] // <-- Y AQUÍ
  },
  {
    path: 'create/:id',
    component: CreateComponent,
    canActivate: [authGuard] // <-- Y AQUÍ
  },
  {
    path: 'results/:id',
    component: ResultsComponent,
    canActivate: [authGuard] // <-- Y AQUÍ
  },
  {
    path: 'estadisticas/:id',
    component: EstadisticasComponent,
    canActivate: [authGuard] // <-- Y AQUÍ
  },
  
  // Opcional: una ruta comodín al final para redirigir rutas no encontradas
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

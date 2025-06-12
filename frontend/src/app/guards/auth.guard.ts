// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

const getTokenFromCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router = inject(Router);

  // 1. Intenta obtener el token de los parámetros de la URL
  const tokenFromUrl = route.queryParamMap.get('token');

  if (tokenFromUrl) {
    // Si viene de la URL, es válido. Lo guardamos en la cookie para futuras navegaciones.
    document.cookie = `td=${tokenFromUrl}; path=/; SameSite=Strict; Secure`;
    return true; // Permite el acceso
  }

  // 2. Si no viene de la URL, busca en la cookie (para navegaciones internas)
  const tokenFromCookie = getTokenFromCookie('td');

  if (tokenFromCookie) {
    return true; // Permite el acceso
  }

  // 3. Si no hay token en ningún lado, redirige a la página principal
  router.navigate(['/']);
  return false;
};

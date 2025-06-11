// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// Función para obtener la cookie
const getTokenFromCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = getTokenFromCookie('td'); // 'td' es el nombre de tu cookie de dashboard

  if (token) {
    return true; // Si hay token, permite el acceso a la ruta protegida
  } else {
    // Si no hay token, redirige a la página de bienvenida
    router.navigate(['/']);
    return false; // Bloquea el acceso a la ruta protegida
  }
};

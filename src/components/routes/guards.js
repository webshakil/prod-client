import { PUBLIC_ROUTES, PROTECTED_ROUTES, SUBSCRIPTION_ROUTES, ADMIN_ROUTES } from './config';

export const getNavRoutes = (userRole) => {
  const allRoutes = [...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
  return allRoutes.filter((route) => {
    if (!route.inNav) return false;
    if (!route.roles) return false;
    return route.roles.includes(userRole);
  });
};

export const getRoutesByRole = (userRole) => {
  if (!userRole) return PUBLIC_ROUTES;
  
  const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
  return allRoutes.filter((route) => {
    if (!route.requiresAuth && route.roles) return false;
    if (route.requiresAuth && route.roles) {
      return route.roles.includes(userRole);
    }
    return true;
  });
};

export const requiresAuth = (pathname) => {
  const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
  const route = allRoutes.find((r) => r.path === pathname);
  return route?.requiresAuth || false;
};

export const requiresRole = (pathname) => {
  const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
  const route = allRoutes.find((r) => r.path === pathname);
  return route?.roles || [];
};
// import { PUBLIC_ROUTES, PROTECTED_ROUTES, SUBSCRIPTION_ROUTES, ADMIN_ROUTES } from './config';

// export const getNavRoutes = (userRole) => {
//   const allRoutes = [...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
//   return allRoutes.filter((route) => {
//     if (!route.inNav) return false;
//     if (!route.roles) return false;
//     return route.roles.includes(userRole);
//   });
// };

// export const getRoutesByRole = (userRole) => {
//   if (!userRole) return PUBLIC_ROUTES;
  
//   const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
//   return allRoutes.filter((route) => {
//     if (!route.requiresAuth && route.roles) return false;
//     if (route.requiresAuth && route.roles) {
//       return route.roles.includes(userRole);
//     }
//     return true;
//   });
// };

// export const requiresAuth = (pathname) => {
//   const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
//   const route = allRoutes.find((r) => r.path === pathname);
//   return route?.requiresAuth || false;
// };

// export const requiresRole = (pathname) => {
//   const allRoutes = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES, ...SUBSCRIPTION_ROUTES, ...ADMIN_ROUTES];
//   const route = allRoutes.find((r) => r.path === pathname);
//   return route?.roles || [];
// };
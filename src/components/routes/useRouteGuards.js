export const ROLES = {
  MANAGER: 'manager',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  AUDITOR: 'auditor',
  EDITOR: 'editor',
  ADVERTISER: 'advertiser',
  ANALYST: 'analyst',
  USER: 'user',
};

export const isAuthenticated = (auth) => {
  console.log('🔍 isAuthenticated check:', {
    isAuthenticated: auth.isAuthenticated,
    accessToken: !!auth.accessToken,
    result: auth.isAuthenticated && !!auth.accessToken,
  });
  
  return auth.isAuthenticated && !!auth.accessToken; // ✅ Changed from auth.token to auth.accessToken
};

export const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  return userRole === requiredRoles;
};

export const isAdmin = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.ADMIN]);
};

export const canManageSubscriptions = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER]);
};

export const canModerateContent = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.ADMIN, ROLES.MODERATOR]);
};

export const canAudit = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.AUDITOR]);
};

export const canAnalyze = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.ANALYST]);
};

export const canEditContent = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.EDITOR]);
};

export const canAdvertise = (userRole) => {
  return hasRole(userRole, [ROLES.MANAGER, ROLES.ADVERTISER]);
};
// export const ROLES = {
//   MANAGER: 'manager',
//   ADMIN: 'admin',
//   MODERATOR: 'moderator',
//   AUDITOR: 'auditor',
//   EDITOR: 'editor',
//   ADVERTISER: 'advertiser',
//   ANALYST: 'analyst',
//   USER: 'user',
// };

// export const isAuthenticated = (auth) => {
//   return auth.isAuthenticated && auth.token;
// };

// export const hasRole = (userRole, requiredRoles) => {
//   if (!userRole) return false;
//   if (Array.isArray(requiredRoles)) {
//     return requiredRoles.includes(userRole);
//   }
//   return userRole === requiredRoles;
// };

// export const isAdmin = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.ADMIN]);
// };

// export const canManageSubscriptions = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER]);
// };

// export const canModerateContent = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.ADMIN, ROLES.MODERATOR]);
// };

// export const canAudit = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.AUDITOR]);
// };

// export const canAnalyze = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.ANALYST]);
// };

// export const canEditContent = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.EDITOR]);
// };

// export const canAdvertise = (userRole) => {
//   return hasRole(userRole, [ROLES.MANAGER, ROLES.ADVERTISER]);
// };
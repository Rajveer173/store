export const ROLES = {
  ADMIN: 'SYSTEM_ADMIN',
  USER: 'NORMAL_USER',
  OWNER: 'STORE_OWNER',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'System Administrator',
  [ROLES.USER]: 'Normal User',
  [ROLES.OWNER]: 'Store Owner',
};

export const ROLE_BADGE_VARIANT = {
  [ROLES.ADMIN]: 'primary',
  [ROLES.USER]: 'neutral',
  [ROLES.OWNER]: 'success',
};

export const ROLE_HOME_PATH = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.USER]: '/stores',
  [ROLES.OWNER]: '/owner/dashboard',
};

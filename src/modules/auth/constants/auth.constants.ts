export const AUTH_ERRORS = {
  USER_EXISTS: 'Username or email already exists',
  USER_NOT_FOUND: 'User with given username or email is not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
} as const;

export const AUTH_CONFIG = {
  JWT_EXPIRATION: '1d',
} as const; 
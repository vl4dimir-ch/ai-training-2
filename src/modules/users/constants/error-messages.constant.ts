export const USER_ERROR_MESSAGES = {
    USERNAME_EXISTS: 'Username already exists',
    EMAIL_EXISTS: 'Email already exists',
    INVALID_FILTERS: 'Invalid filter parameters',
    USER_NOT_FOUND: (id: number) => `User with ID ${id} not found or doesn't match filters`,
} as const; 
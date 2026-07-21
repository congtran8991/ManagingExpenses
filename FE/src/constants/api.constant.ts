export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    REGISTER: '/v1/auth/register',
    GET_ME: '/v1/auth/me',
    REFRESH_TOKEN: '/v1/auth/refresh-token',
  },
  WALLETS: '/v1/wallets',
  PERIODS: {
    BASE: '/v1/periods',
    CATEGORIES: (id: number) => `/v1/periods/${id}/categories`,
  },
  TRANSACTIONS: '/v1/transactions',
  SAVINGS_GOALS: {
    BASE: '/v1/savings-goals',
    DEPOSIT: (id: number) => `/v1/savings-goals/${id}/deposit`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
} as const;

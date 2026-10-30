import '@tanstack/react-query';
import type { ErrorApi } from '../services/error_api';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ErrorApi;
  }
}

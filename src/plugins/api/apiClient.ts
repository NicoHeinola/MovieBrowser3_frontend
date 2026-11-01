import axios from 'axios';

import { getEnvNumber } from '@/utils/env/getEnvNumber';
import { getEnvString } from '@/utils/env/getEnvString';

const apiBaseUrl = getEnvString('VITE_API_URL');
const requestTimeoutMs = getEnvNumber('VITE_API_TIMEOUT_MS');

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: requestTimeoutMs,
});

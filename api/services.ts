// Adding Content-Type application/json header

import axios from 'axios';

export const apiService = axios.create({
  baseURL: 'your_base_url', // Replace with your base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

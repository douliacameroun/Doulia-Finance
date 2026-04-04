// Adding Content-Type application/json header to API requests.

import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;
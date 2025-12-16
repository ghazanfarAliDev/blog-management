// auth.ts

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:3000/'; 

// 2. Create an Axios instance for common settings
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  id: string;
  name: string;
  email: string;
}


export async function loginService(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    const { token, email } = response.data;
    localStorage.setItem('authToken', token);
    document.cookie = `token=${token}; path=/;`;

    
    console.log('Login successful for user:', email);
    
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {      
      const errorMessage = error.response.data.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage); 
      
    } else if (axios.isAxiosError(error) && error.request) {
      throw new Error('Network error. Could not reach the server.');
    } else {
      throw new Error('An unexpected error occurred during login.');
    }
  }
}

export function logout(): void {
  localStorage.removeItem('authToken');
}

export function getToken(): string | null {
    return localStorage.getItem('authToken');
}
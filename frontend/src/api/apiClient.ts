const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('transitops_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete(path: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('transitops_token');
        localStorage.removeItem('transitops_logged_in');
        window.location.href = '/login';
      }
      if (response.status === 403) {
        throw new Error('Action blocked: Your current role does not have the required permissions.');
      }
      const err = await response.json().catch(() => ({}));
      let errMsg = 'API request failed';
      if (err.detail) {
        errMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
      }
      throw new Error(errMsg);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();

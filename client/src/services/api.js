
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('permitProToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('permitProToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('permitProToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response.user;
  }

  async getPermits() {
    return this.request('/packages');
  }

  async createPermit(packageData) {
    return this.request('/packages', {
      method: 'POST',
      body: packageData,
    });
  }

  async getPackageById(id) {
    return this.request(`/packages/${id}`);
  }

  async updatePackageStatus(id, status) {
    return this.request(`/packages/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async uploadDocument(packageId, documentData) {
    return this.request(`/packages/${packageId}/documents`, {
      method: 'POST',
      body: documentData,
    });
  }
}

export default new ApiService();

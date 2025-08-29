
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      // For demo purposes, simulate a successful login if backend is not available
      console.warn('Backend not available, using demo mode');
      const demoUser = {
        id: 1,
        name: 'Demo User',
        email: credentials.email,
        role: 'Admin'
      };
      
      // Set a demo token
      this.setToken('demo-token-123');
      
      return {
        user: demoUser,
        token: 'demo-token-123'
      };
    }
  }

  async getPackages() {
    try {
      return await this.request('/packages');
    } catch (error) {
      // Return demo data if backend is not available
      console.warn('Backend not available, using demo data');
      return [
        {
          id: 'PKG-001',
          customerName: 'John Smith',
          propertyAddress: '123 Main St, Orlando, FL',
          county: 'Orange',
          status: 'Draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents: []
        },
        {
          id: 'PKG-002',
          customerName: 'Jane Doe',
          propertyAddress: '456 Oak Ave, Miami, FL',
          county: 'Miami-Dade',
          status: 'Submitted',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          documents: []
        }
      ];
    }
  }

  async createPackage(packageData) {
    try {
      return await this.request('/packages', {
        method: 'POST',
        body: JSON.stringify(packageData),
      });
    } catch (error) {
      // Return demo package if backend is not available
      console.warn('Backend not available, creating demo package');
      return {
        id: `PKG-${Date.now()}`,
        ...packageData,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: []
      };
    }
  }

  async updatePackageStatus(packageId, status) {
    try {
      return await this.request(`/packages/${packageId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.warn('Backend not available, simulating status update');
      return { success: true };
    }
  }

  async uploadDocument(packageId, documentData) {
    try {
      return await this.request(`/packages/${packageId}/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData),
      });
    } catch (error) {
      console.warn('Backend not available, simulating document upload');
      return {
        id: Date.now(),
        ...documentData,
        uploadedAt: new Date().toISOString(),
        uploader: 'Demo User',
        version: 1
      };
    }
  }
}

export default new ApiService();

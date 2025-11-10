const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  // User management
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Inventory management
  async getRetailProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inventory/retail-products${queryString ? `?${queryString}` : ''}`);
  }

  async createRetailProduct(productData) {
    return this.request('/inventory/retail-products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateRetailProduct(productId, productData) {
    return this.request(`/inventory/retail-products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async getRepairParts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inventory/repair-parts${queryString ? `?${queryString}` : ''}`);
  }

  async createRepairPart(partData) {
    return this.request('/inventory/repair-parts', {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  }

  async updateRepairPart(partId, partData) {
    return this.request(`/inventory/repair-parts/${partId}`, {
      method: 'PUT',
      body: JSON.stringify(partData),
    });
  }

  async getLowStockItems() {
    return this.request('/inventory/low-stock');
  }

  // Sales management
  async searchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales/products/search${queryString ? `?${queryString}` : ''}`);
  }

  async createSalesCart(cartData) {
    return this.request('/sales/cart', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  async processSale(saleData) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async getSales(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/sales${queryString ? `?${queryString}` : ''}`);
  }

  async getSaleById(saleId) {
    return this.request(`/sales/${saleId}`);
  }

  // Repair management
  async getRepairJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/repairs${queryString ? `?${queryString}` : ''}`);
  }

  async createRepairJob(jobData) {
    return this.request('/repairs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateRepairJobStatus(jobId, statusData) {
    return this.request(`/repairs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async assignTechnician(jobId, technicianData) {
    return this.request(`/repairs/${jobId}/assign-technician`, {
      method: 'PUT',
      body: JSON.stringify(technicianData),
    });
  }

  async addPartToRepairJob(jobId, partData) {
    return this.request(`/repairs/${jobId}/parts`, {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  }

  async generateRepairInvoice(jobId) {
    return this.request(`/repairs/${jobId}/invoice`);
  }

  async getCustomerRepairHistory(customerId) {
    return this.request(`/repairs/customer/${customerId}/history`);
  }

  // Master Data management
  async getAllMasterData() {
    return this.request('/master-data/all');
  }

  async getBrands() {
    return this.request('/master-data/brands');
  }

  async createBrand(brandData) {
    return this.request('/master-data/brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  }

  async updateBrand(brandId, brandData) {
    return this.request(`/master-data/brands/${brandId}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
  }

  async deleteBrand(brandId) {
    return this.request(`/master-data/brands/${brandId}`, {
      method: 'DELETE',
    });
  }

  async getModels() {
    return this.request('/master-data/models');
  }

  async createModel(modelData) {
    return this.request('/master-data/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  }

  async updateModel(modelId, modelData) {
    return this.request(`/master-data/models/${modelId}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
  }

  async deleteModel(modelId) {
    return this.request(`/master-data/models/${modelId}`, {
      method: 'DELETE',
    });
  }

  async getProductNames() {
    return this.request('/master-data/product-names');
  }

  async createProductName(productNameData) {
    return this.request('/master-data/product-names', {
      method: 'POST',
      body: JSON.stringify(productNameData),
    });
  }

  async updateProductName(productNameId, productNameData) {
    return this.request(`/master-data/product-names/${productNameId}`, {
      method: 'PUT',
      body: JSON.stringify(productNameData),
    });
  }

  async deleteProductName(productNameId) {
    return this.request(`/master-data/product-names/${productNameId}`, {
      method: 'DELETE',
    });
  }

  async getPartNames() {
    return this.request('/master-data/part-names');
  }

  async createPartName(partNameData) {
    return this.request('/master-data/part-names', {
      method: 'POST',
      body: JSON.stringify(partNameData),
    });
  }

  async updatePartName(partNameId, partNameData) {
    return this.request(`/master-data/part-names/${partNameId}`, {
      method: 'PUT',
      body: JSON.stringify(partNameData),
    });
  }

  async deletePartName(partNameId) {
    return this.request(`/master-data/part-names/${partNameId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

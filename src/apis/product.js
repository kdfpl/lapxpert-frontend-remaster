import api from "./axiosAPI";

const API_URL = "/products";

const productService = {
  async getAllProducts() {
    try {
      const response = await api.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  },

  async getActiveProducts() {
    try {
      const response = await api.get(`${API_URL}/list`);
      return response.data;
    } catch (error) {
      console.error("Error fetching active products:", error.response?.data || error.message);
      throw error;
    }
  },

  async addProduct(sanPham) {
    try {
      const response = await api.post(`${API_URL}/add`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateProduct(id, sanPham) {
    try {
      const response = await api.put(`${API_URL}/update/${id}`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error.message);
      throw error;
    }
  },

  async softDeleteProduct(id) {
    try {
      const response = await api.delete(`${API_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default productService;
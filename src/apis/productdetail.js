import api from "./axiosAPI";

const API_URL = "/products-details";

const productDetailService = {
  async getActiveProductsDetailed() {
    try {
      const response = await api.get(`${API_URL}/list`);
      return response.data;
    } catch (error) {
      console.error("Error fetching detailed active products:", error.response?.data || error.message);
      throw error;
    }
  },

  async addProductDetailed(sanPham) {
    try {
      const response = await api.post(`${API_URL}/add`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error adding detailed product:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateProductDetailed(id, sanPham) {
    try {
      const response = await api.put(`${API_URL}/update/${id}`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error updating detailed product:", error.response?.data || error.message);
      throw error;
    }
  },

  async softDeleteProductDetailed(id) {
    try {
      const response = await api.delete(`${API_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting detailed product:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default productDetailService;
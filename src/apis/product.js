import {privateApi} from "./axiosAPI";

const privateApi_URL = "/products";

const productService = {
  async getAllProducts() {
    try {
      const response = await privateApi.get(`${privateApi_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  },

  async getActiveProducts() {
    try {
      const response = await privateApi.get(`${privateApi_URL}/list`);
      return response.data;
    } catch (error) {
      console.error("Error fetching active products:", error.response?.data || error.message);
      throw error;
    }
  },

  async addProduct(sanPham) {
    try {
      const response = await privateApi.post(`${privateApi_URL}/add`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      throw error;
    }
  },

  async addMultipleProduct(sanPham) {
    try {
      const response = await privateApi.post(`${privateApi_URL}/addMultiple`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateProduct(id, sanPham) {
    try {
      const response = await privateApi.put(`${privateApi_URL}/update/${id}`, sanPham);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error.response?.data || error.message);
      throw error;
    }
  },

  async softDeleteProduct(id) {
    try {
      const response = await privateApi.delete(`${privateApi_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default productService;
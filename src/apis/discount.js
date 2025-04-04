import api from "./axiosAPI";

const API_URL = "/discounts";

const discountService = {
  async getAllDiscounts() {
    try {
      const response = await api.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discounts:", error.response?.data || error.message);
      throw error;
    }
  },

  async saveDiscount(discount) {
    try {
      const response = await api.put(`${API_URL}`, discount);
      return response.data;
    } catch (error) {
      console.error("Error save discount:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteDiscount(discountId) {
    try {
      const response = await api.post(`${API_URL}/toggle/${discountId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting discount:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteDiscounts(discountIds) {
    try {
      const response = await api.post(`${API_URL}/toggles`, discountIds);
      return response.data;
    } catch (error) {
      console.error("Error deleting discounts:", error.response?.data || error.message);
      throw error;
    }
  },

  async addDiscountToProducts(discountId, productIds) {
    try {
      const response = await api.put(`${API_URL}/${discountId}/spct`, productIds);
      return response.data;
    } catch (error) {
      console.error("Error adding discount to product:", error.response?.data || error.message);
      throw error;
    }
  },

  async removeDiscountFromProducts(discountId, productIds) {
    try {
      const response = await api.delete(`${API_URL}/${discountId}/spct`, { data: productIds });
      return response.data;
    } catch (error) {
      console.error("Error removing discount from products:", error.response?.data || error.message);
      throw error;
    }
  },

  async getDiscountProducts(discountId) {
    try {
      const response = await api.get(`${API_URL}/${discountId}/spct`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discount products:", error.response?.data || error.message);
      throw error;
    }
  },
}

export default discountService;
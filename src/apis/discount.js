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

  async addDiscount(discount) {
    try {
      const response = await api.put(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error add discount:", error.response?.data || error.message);
      throw error;
    }
  },

  async updateDiscount(discount) {
    try {
      const response = await api.put(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error update discount:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default discountService;
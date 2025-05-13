import {privateApi} from "./axiosAPI";

const privateApi_URL = "/discounts";

const discountService = {
  async getAllDiscounts() {
    try {
      const response = await privateApi.get(`${privateApi_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discounts:", error.response?.data || error.message);
      throw error;
    }
  },

  async getDiscountById(discountId) {
    try {
      const response = await privateApi.get(`${privateApi_URL}/${discountId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discount by ID:", error.response?.data || error.message);
      throw error;
    }
  },

  async saveDiscount(discount) {
    try {
      const response = await privateApi.put(`${privateApi_URL}`, discount);
      return response.data;
    } catch (error) {
      console.error("Error save discount:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteDiscount(discountId) {
    try {
      const response = await privateApi.post(`${privateApi_URL}/toggle/${discountId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting discount:", error.response?.data || error.message);
      throw error;
    }
  },

  async deleteDiscounts(discountIds) {
    try {
      const response = await privateApi.post(`${privateApi_URL}/toggles`, discountIds);
      return response.data;
    } catch (error) {
      console.error("Error deleting discounts:", error.response?.data || error.message);
      throw error;
    }
  },

  async addDiscountToProducts(discountId, productIds) {
    try {
      const response = await privateApi.put(`${privateApi_URL}/${discountId}/spct`, productIds);
      return response.data;
    } catch (error) {
      console.error("Error adding discount to product:", error.response?.data || error.message);
      throw error;
    }
  },

  async removeDiscountFromProducts(discountId, productIds) {
    try {
      const response = await privateApi.delete(`${privateApi_URL}/${discountId}/spct`, { data: productIds });
      return response.data;
    } catch (error) {
      console.error("Error removing discount from products:", error.response?.data || error.message);
      throw error;
    }
  },

  async getDiscountProducts(discountId) {
    try {
      const response = await privateApi.get(`${privateApi_URL}/${discountId}/spct`);
      return response.data;
    } catch (error) {
      console.error("Error fetching discount products:", error.response?.data || error.message);
      throw error;
    }
  },
}

export default discountService;

import api from "./axiosAPI";

const API_URL = "/san-pham";

const productService = {
  async getAllProducts() {
    try {
      const response = await api.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
      throw error;
    }
  }

}

export default productService;
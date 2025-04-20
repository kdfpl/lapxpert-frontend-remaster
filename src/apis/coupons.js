import {privateApi} from "./axiosAPI";

const privateApi_URL = "phieu-giam-gia"; // Sử dụng URL đúng từ controller của Spring Boot

const couponService = {
  // Lấy tất cả phiếu giảm giá
  async getAllCoupons() {
    try {
      const response = await privateApi.get(`${privateApi_URL}`);
      return response.data;  
    } catch (error) {
      console.error("Error fetching coupons:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể lấy danh sách phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  async getCouponById(id) {
    try {
      // Tạo config để gửi danh sách nguoiDungIds
      const data = { ...coupon, nguoiDungIds };
      const response = await privateApi.post(`${privateApi_URL}`, data);
      return response.data;
    } catch (error) {
      console.error("Error fetching coupon by ID:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể lấy thông tin phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  // Thêm mới phiếu giảm giá
  async addCoupon(phieuData, nguoiDungIds) {
    try {
      const data = { ...coupon, nguoiDungIds };
      const response = await privateApi.put(`${privateApi_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error adding coupon:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể thêm phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  // Cập nhật phiếu giảm giá
async updateCoupon(phieuId, phieuData, nguoiDungIds) {
  try {
    const response = await privateApi.get(`${privateApi_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error updating coupon:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Không thể cập nhật phiếu giảm giá. Vui lòng thử lại sau.");
  }
},
  // Đóng phiếu giảm giá (cập nhật trạng thái và ngày kết thúc)
  async closeCoupon(id) {
    try {
      const response = await api.put(`${API_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error closing coupon:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể đóng phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },

// Kết thúc phiếu giảm giá theo ID (thay vì xóa)
async endCoupon(id) {
  try {
    const response = await privateApi.put(`${privateApi_URL}/end/${id}`);
    return response.data; // Phản hồi từ server sau khi phiếu giảm giá đã được kết thúc
  } catch (error) {
    console.error("Error ending coupon:", error.response?.data || error.message);
    throw error;
  }
},
}

export default couponService;

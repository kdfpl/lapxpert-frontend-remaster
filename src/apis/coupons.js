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
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  },  

  // Tạo phiếu giảm giá mới
  async createCoupon(coupon, nguoiDungIds) {
    try {
      // Tạo config để gửi danh sách nguoiDungIds
      const data = { ...coupon, nguoiDungIds };
      const response = await privateApi.post(`${privateApi_URL}`, data);
      return response.data;
    } catch (error) {
      console.error("Error creating coupon:", error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật phiếu giảm giá
  async updateCoupon(id, coupon, nguoiDungIds) {
    try {
      const data = { ...coupon, nguoiDungIds };
      const response = await privateApi.put(`${privateApi_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating coupon:", error.response?.data || error.message);
      throw error;
    }
  },  
// Lấy chi tiết phiếu giảm giá theo ID
async getCouponById(id) {
  try {
    const response = await privateApi.get(`${privateApi_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching coupon details:", error.response?.data || error.message);
    throw error;
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

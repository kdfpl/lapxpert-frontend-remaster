
import api from "./axiosAPI";

const API_URL = "phieu-giam-gia";

const couponService = {
  // Lấy tất cả phiếu giảm giá
  async getAllCoupons() {
    try {
      const response = await api.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching coupons:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể lấy danh sách phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  async getCouponById(id) {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching coupon by ID:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể lấy thông tin phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  // Thêm mới phiếu giảm giá
  async addCoupon(phieuData, nguoiDungIds) {
    try {
      const payload = {
        ...phieuData,
        danhSachNguoiDung: phieuData.phieuRiengTu && nguoiDungIds?.length > 0 ? nguoiDungIds : null,
      };
      const response = await api.post(`${API_URL}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error adding coupon:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Không thể thêm phiếu giảm giá. Vui lòng thử lại sau.");
    }
  },
  // Cập nhật phiếu giảm giá
async updateCoupon(phieuId, phieuData, nguoiDungIds) {
  try {
    const payload = {
      ...phieuData,
      danhSachNguoiDung: phieuData.phieuRiengTu && nguoiDungIds?.length > 0 ? nguoiDungIds : null,
    };
    const response = await api.put(`${API_URL}/${phieuId}`, payload);
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

};

export default couponService;

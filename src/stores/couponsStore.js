import { defineStore } from 'pinia'
import couponService from '@/apis/coupons'

export const usePhieuGiamGiaStore = defineStore('phieuGiamGia', {
  state: () => ({
    phieuGiamGiaList: [],
    currentPhieu: null,
    loading: false,
    error: null,
  }),

  actions: {
    // Lấy tất cả phiếu giảm giá
    async fetchPhieuGiamGia() {
      this.loading = true
      try {
        const response = await couponService.getAllCoupons()
        this.phieuGiamGiaList = response || []
      } catch (error) {
        this.error = error.response?.data?.message || error.message
      } finally {
        this.loading = false
      }
    },

    // Lấy phiếu giảm giá theo ID
    async fetchPhieuById(id) {
      this.loading = true
      try {
        const response = await couponService.getCouponById(id)
        this.currentPhieu = response
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Tạo phiếu giảm giá mới
    async createPhieu(phieuData, nguoiDungIds) {
      this.loading = true
      try {
        const response = await couponService.createCoupon(phieuData, nguoiDungIds)
        this.phieuGiamGiaList.push(response)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cập nhật phiếu giảm giá
    async updatePhieu(id, phieuData, nguoiDungIds) {
      this.loading = true
      try {
        const response = await couponService.updateCoupon(id, phieuData, nguoiDungIds)
        const index = this.phieuGiamGiaList.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.phieuGiamGiaList[index] = response
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Kết thúc phiếu giảm giá (thay vì xóa)
    async endPhieu(id) {
      this.loading = true;
      try {
        const response = await couponService.endCoupon(id);  // Gọi API để kết thúc phiếu giảm giá
        const index = this.phieuGiamGiaList.findIndex((p) => p.id === id);
        if (index !== -1) {
          this.phieuGiamGiaList[index].trangThai = 'KET_THUC';  // Cập nhật trạng thái của phiếu giảm giá thành "Kết thúc"
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },    

    // Khôi phục phiếu giảm giá (nếu có API)
    async restorePhieu(id) {
      this.loading = true
      try {
        await couponService.restoreCoupon(id) // Bạn cần phải tạo API này ở backend nếu cần
        const index = this.phieuGiamGiaList.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.phieuGiamGiaList[index].trangThai = 'DA_DIEN_RA'  // Điều chỉnh trạng thái nếu cần
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message
        throw error
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    // Lọc phiếu giảm giá đang hoạt động
    activePhieu: (state) => {
      return Array.isArray(state.phieuGiamGiaList)
        ? state.phieuGiamGiaList.filter((p) => p.trangThai === 'DA_DIEN_RA')
        : []
    },

    // Lọc phiếu giảm giá đã hết hạn (hoặc đã bị xóa)
    inactivePhieu: (state) => {
      return Array.isArray(state.phieuGiamGiaList)
        ? state.phieuGiamGiaList.filter((p) => p.trangThai === 'KET_THUC')
        : []
    },
  },
})

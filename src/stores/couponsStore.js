import { defineStore } from 'pinia';
import couponService from '@/apis/coupons';

export const usePhieuGiamGiaStore = defineStore('phieuGiamGia', {
  state: () => ({
    phieuGiamGiaList: [],
    currentPhieu: null,
    loading: false,
    error: null,
    search: '',
    statusFilter: 'all',
    startDate: '',
    endDate: '',
    showSuggestions: false,
    searchSuggestions: [],
  }),

  actions: {
    async fetchPhieuGiamGia() {
      this.loading = true;
      try {
        const response = await couponService.getAllCoupons();
        this.phieuGiamGiaList = response || [];
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        alert(this.error);
      } finally {
        this.loading = false;
      }
    },
    async fetchPhieuById(id) {
      this.loading = true;
      this.error = '';
      try {
        const response = await couponService.getCouponById(id);
        this.currentPhieu = response;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error("Lỗi khi lấy phiếu giảm giá theo ID:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createPhieu(phieuData, nguoiDungIds) {
      this.loading = true;
      this.error = '';
      try {
        const response = await couponService.addCoupon(phieuData, nguoiDungIds);
        this.phieuGiamGiaList.push(response);
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error('Lỗi khi tạo phiếu giảm giá:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // Cập nhật phiếu giảm giá
    async updatePhieu(id, phieuData, nguoiDungIds) {
      this.loading = true;
      this.error = '';
      try {
        const response = await couponService.updateCoupon(id, phieuData, nguoiDungIds);
        
        // Cập nhật phiếu giảm giá trong phieuGiamGiaList
        const updatedCouponIndex = this.phieuGiamGiaList.findIndex(coupon => coupon.id === id);
        if (updatedCouponIndex !== -1) {
          this.phieuGiamGiaList[updatedCouponIndex] = { ...this.phieuGiamGiaList[updatedCouponIndex], ...response };
        }
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error("Lỗi khi cập nhật phiếu giảm giá:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // Thêm hành động đóng phiếu giảm giá
    async closePhieu(id) {
      this.loading = true;
      this.error = '';
      try {
        // Gọi service để đóng phiếu
        const response = await couponService.closeCoupon(id);

        // Cập nhật lại trạng thái trong phieuGiamGiaList
        const updatedCoupon = this.phieuGiamGiaList.find(coupon => coupon.id === id);
        if (updatedCoupon) {
          updatedCoupon.trangThai = "KET_THUC"; // Đặt trạng thái là "Kết thúc"
          updatedCoupon.ngayKetThuc = new Date().toISOString(); // Hoặc sử dụng OffsetDateTime nếu cần
        }
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message;
        console.error("Lỗi khi đóng phiếu giảm giá:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
  
  setStatusFilter(status) {
    this.statusFilter = status;
  },

  setStartDate(date) {
    this.startDate = date;
  },

  setEndDate(date) {
    this.endDate = date;
  },

  filterCoupons() {
    return this.phieuGiamGiaList.filter((coupon) => {
      const matchesSearch =
        !this.search ||
        (coupon.maPhieuGiamGia && coupon.maPhieuGiamGia.toLowerCase().includes(this.search.toLowerCase())) ||
        (coupon.giaTriGiam && coupon.giaTriGiam.toString().includes(this.search)) ||
        (coupon.giaTriDonHangToiThieu && coupon.giaTriDonHangToiThieu.toString().includes(this.search));

      const matchesStatus =
        this.statusFilter === 'all' || coupon.trangThai === this.statusFilter;

      const matchesDateRange =
        (!this.startDate || new Date(coupon.ngayBatDau) >= new Date(this.startDate)) &&
        (!this.endDate || new Date(coupon.ngayKetThuc) <= new Date(this.endDate));

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  },
},

  getters: {
  filteredCoupons: (state) => state.filterCoupons(),
},
});

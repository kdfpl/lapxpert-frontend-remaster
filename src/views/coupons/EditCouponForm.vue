<template>
    <div>
      <h2>Cập nhật phiếu giảm giá</h2>
      <form @submit.prevent="updateCoupon">
        <!-- Các input tương tự như form thêm mới, nhưng giá trị mặc định lấy từ dữ liệu phiếu giảm giá hiện tại -->
        <div>
          <label for="maPhieuGiamGia">Mã phiếu giảm giá</label>
          <input v-model="coupon.maPhieuGiamGia" type="text" id="maPhieuGiamGia" />
        </div>
        <div>
          <label for="giaTriGiam">Giá trị giảm</label>
          <input v-model="coupon.giaTriGiam" type="number" id="giaTriGiam" />
        </div>
        <!-- Các trường khác như ngày bắt đầu, ngày kết thúc, số lượng, trạng thái... -->
        <button type="submit">Cập nhật</button>
      </form>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePhieuGiamGiaStore } from '@/stores/couponstore';

  const router = useRouter();
  const route = useRoute();
  const phieuGiamGiaStore = usePhieuGiamGiaStore();

  // Dữ liệu phiếu giảm giá sẽ được lưu trong một đối tượng coupon
  const coupon = ref({
    id: null,
    maPhieuGiamGia: '',
    giaTriGiam: '',
    // Các trường khác
  });

  onMounted(async () => {
    // Lấy thông tin phiếu giảm giá từ backend hoặc store khi route params có id
    const { id } = route.params;
    if (id) {
      const couponData = await phieuGiamGiaStore.getCouponById(id);
      coupon.value = couponData;  // Cập nhật dữ liệu vào form
    }
  });

  const updateCoupon = async () => {
    // Gửi yêu cầu cập nhật phiếu giảm giá
    await phieuGiamGiaStore.updateCoupon(coupon.value);
    // Sau khi cập nhật thành công, chuyển về danh sách phiếu giảm giá
    router.push({ name: 'phieuGiamGiaList' });
  };
  </script>

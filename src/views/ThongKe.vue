<script>
import Year from "../components/ThongKe/DoanhThu/Year.vue";
import Month from "../components/ThongKe/DoanhThu/Month.vue";
import Week from "../components/ThongKe/DoanhThu/Week.vue";
import TopThang from "../components/ThongKe/Top/TopMonth.vue";
import TopTuan from "../components/ThongKe/Top/TopWeek.vue";
import TopNgay from "../components/ThongKe/Top/TopNgay.vue";
import TTKH from "../components/ThongKe/TTKH.vue";

import { ref, } from "vue";
import TableAdv from "../components/ThongKe/TableAdv.vue";
import TableAdv1 from "../components/ThongKe/TableAdv copy.vue";
import NotificationsWidget from "@/components/ThongKe/dashboard/NotificationsWidget.vue";
import BestSellingWidget from "@/components/ThongKe/dashboard/BestSellingWidget.vue";
import StatsWidget from "@/components/ThongKe/dashboard/StatsWidget.vue";
// import TableAdv from "./TableAdv.vue";

;

export default {

  components: {
    StatsWidget,
    NotificationsWidget,
    BestSellingWidget,
    Year,
    Month,
    Week,
    TableAdv,
    TableAdv1,
    TopThang,
    TopTuan,
    TopNgay,
    TTKH,
  },

  setup() {
    const selectedDoanhThu = ref(Year);
    const selectedTop = ref(TopNgay);
    const hoaDons = ref([]);
    const donHangs = ref([]);
    const ThanhViens = ref([]);

    return {
      selectedDoanhThu,
      selectedTop,
      hoaDons,
      donHangs,
      ThanhViens,

    };
  },
};
</script>

<template>
  <div >
    <div class="flex flex-row  justify-center  mb-3">
    <StatsWidget/>

  <!-- <div class="  bg-white rounded border-white p-5 flex flex basis-1/4 mr-3">
        <div class="basis-64">
          <div class="text-2xl text-[#8B658B] font-bold">
            231
          </div>
          <div class="text-sm mb-10">Tổng số đơn hàng</div>
          <div>
            <div class="text-xs text-[#7A8B8B]"><a href="/order">See more...</a></div>
          </div>
        </div>
        <div class="mt-4 w-[90px]">
          <img src="/src/assets/img/shopping-cart.png" alt="" />
        </div>
      </div>

      <div class=" bg-white rounded border-white p-5 flex flex basis-1/4 mr-3">
        <div class=" basis-64">
          <div class="text-2xl text-[#CD5555] font-bold">
              328
          </div>
          <div class="text-sm mb-10">Doanh Số</div>
          <div class="flex flex">
            <div class="text-xs mr-2 text-[#7A8B8B]">
              <a href="/NhanVien">See more...</a>
            </div>
          </div>
        </div>
        <div class=" mt-4 w-[90px]">
          <img src="/src/assets/img/money.png" alt="" />
        </div>
      </div>

      <div class=" bg-white rounded border-white p-5 flex flex basis-1/4 mr-3">
        <div class=" basis-64">
          <div class="text-2xl text-[#FF1493] font-bold">
            6
            </div>
          <div class="text-sm mb-10">Sản phẩm</div>
          <div class="flex flex">
            <div class="text-xs mr-2 text-[#7A8B8B]">
              <a href="/san-pham">See more...</a>
            </div>
          </div>
        </div>
        <div class="ml-14 mt-4 w-[90px]">
          <img src="/src/assets/img/box.png" alt="" />
        </div>
      </div>

      <div
        class="    bg-white rounded border-white p-5 flex flex basis-1/4 ">
        <div class=" basis-64">
          <div class="text-2xl text-[#CD9B1D] font-bold">136.000.000đ</div>
          <div class="text-sm mb-10">Thu nhập</div>
          <div class="flex flex">
            <div class="text-xs mr-2 text-[#7A8B8B]">
              <a href="">See more...</a>
            </div>
          </div>
        </div>
        <div class=" mt-4 w-[90px]">
          <img
            src="/src/assets/img/give-money.png"
            alt="" />
        </div>
      </div> -->
    </div>
    <div class=" flex flex-row mb-3 ">
      <div class="bg-white p-8 basis-2/3 mr-3">
        <div class="flex flex-row">
          <h4 class="mb-3 mt-2 ml-2">Đơn hàng gần đây</h4>
        </div>
        <a href="/order" class="ml-2 text-[#696969]">See more...</a>



    <div class="overflow-auto mr-3 rounded-lg shadow-md">
<TableAdv1/>

  </div>
      </div>

      <div
      ref="containerRef"
      class="bg-white flex flex-col p-8  transition-all duration-300 overflow-hidden"
      :class="isScrollbarVisible ? 'basis-2/3' : 'basis-1/3'">
      <!-- <BestSellingWidget/> -->

        <h5 class="mb-12">Top Sản phẩm bán chạy hiện nay
          </h5>
          <div class="flex justify-center mb-6 text-[#FFFFFF]">
          <button @click="selectedTop = 'TopNgay' " class="px-3 py-2 rounded-l-lg bg-gray-400">
            Day
          </button>
          <button @click="selectedTop = 'TopTuan'" class="px-3 py-2 bg-gray-400">
            Week
          </button>
          <button @click="selectedTop = 'TopThang'" class="px-3 py-2 rounded-r-lg bg-gray-400">
            Month
          </button>
        </div>
        <component  :is="selectedTop" />
      </div>
    </div>

    <div class=" flex flex-row ">
      <div class="bg-white basis-1/3  p-8 mr-3">
<NotificationsWidget/>
      </div>
      <div
      ref="containerRef"
      class="bg-white flex flex-col p-8  transition-all duration-300 overflow-hidden"
      :class="isScrollbarVisible ? 'basis-3/4' : 'basis-2/3'">

        <h4 class="mb-12">Biểu đồ doanh thu</h4>
        <div class="flex justify-center text-[#FFFFFF]">
          <button @click="selectedDoanhThu = 'Year' " class="px-3 py-2 rounded-l-lg bg-gray-400">
            Year
          </button>
          <button @click="selectedDoanhThu = 'Month'" class="px-3 py-2 bg-gray-400">
            Month
          </button>
          <button @click="selectedDoanhThu = 'Week'" class="px-3 py-2 rounded-r-lg bg-gray-400">
            Week
          </button>
        </div>
        <div class="mb-5 basis-2/3 ">
          <component  :is="selectedDoanhThu" />
        </div>
      </div>

    </div>
  </div>
</template>

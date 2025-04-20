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
import DTCustom from "@/components/ThongKe/DoanhThu/DTCustom.vue";
import TopCustom from "@/components/ThongKe/Top/TopCustom.vue";

;

export default {

  components: {
    StatsWidget,
    NotificationsWidget,
    BestSellingWidget,
    Year,
    Month,
    Week,
    DTCustom,
    TableAdv,
    TableAdv1,
    TopThang,
    TopTuan,
    TopNgay,
    TopCustom,
    TTKH,
  },

  setup() {
    const selectedDoanhThu = ref(Month);
    const selectedTop = ref(TopTuan);
    const hoaDons = ref([]);
    const donHangs = ref([]);
    const ThanhViens = ref([]);
    const startDate = ref('');
    const endDate = ref('');
    const startDateTop = ref('');
    const endDateTop = ref('');

    return {
      selectedDoanhThu,
      selectedTop,
      hoaDons,
      donHangs,
      ThanhViens,
      startDate,
      endDate,
      startDateTop,
      endDateTop
    };
  },
};
</script>

<template>
  <div >
    <div class="flex flex-row  justify-center  mb-3">
    <StatsWidget/>

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

        <h5 class="mb-3">Top Sản phẩm bán chạy hiện nay
          </h5>
          <div class="mb-2 flex justify-end">
          <input type="date" v-model="startDateTop"  class=" h-7 w-32 px-2 py-1 rounded-lg bg-gray-500 text-[#FFFFFF]"/> _
          <input type="date" v-model="endDateTop" class="h-7 w-32 px-2 py-1 rounded-lg bg-gray-500 text-[#FFFFFF] "/>
  </div>
  <button @click="selectedTop = 'TopCustom'"  class=" h-7 w-19 px-3 py-2 rounded-lg bg-gray-400 text-[#FFFFFF]">Tùy chỉnh</button>
  <br>

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
        <component  :is="selectedTop" :start_dateTop="startDateTop" :end_dateTop="endDateTop" />
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

        <div class="mb-4 flex justify-end">
          <input type="date" v-model="startDate" placeholder="Ngày bắt đầu" class="px-3 py-2 rounded-lg bg-gray-500 text-[#FFFFFF]"/> _
          <input type="date" v-model="endDate" placeholder="Ngày kết thúc" class="px-3 py-2 rounded-lg bg-gray-500 text-[#FFFFFF] mr-2"/>
          <button @click="selectedDoanhThu = 'DTCustom'"  class="px-3 py-2 rounded-lg bg-gray-400 text-[#FFFFFF]">Tùy chỉnh</button>
  </div>
        <div class="flex justify-center text-[#FFFFFF]">
          <button @click="selectedDoanhThu = 'Week' " class="px-3 py-2 rounded-l-lg bg-gray-400">
Week
          </button>
          <button @click="selectedDoanhThu = 'Month'" class="px-3 py-2 bg-gray-400">
            Month
          </button>
          <button @click="selectedDoanhThu = 'Year'" class="px-3 py-2 rounded-r-lg bg-gray-400">
            Year
          </button>
        </div>
        <div class="mb-5 basis-2/3 ">
          <component :is="selectedDoanhThu" :start_date="startDate" :end_date="endDate" />

        </div>
      </div>

    </div>
  </div>
</template>

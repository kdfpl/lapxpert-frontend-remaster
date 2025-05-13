import { privateApi } from './axiosAPI';
const API_URL = 'http://localhost:8080/api/v1/thong-ke'; // Đổi theo API backend của bạn

export default {
    getAllHoaDons() {
        return privateApi.get(`${API_URL}/hoa-don`);
    },
    getDoanhSo(){
      return privateApi.get(`${API_URL}/doanh-so`);
    },
    getDoanhThu(){
      return privateApi.get(`${API_URL}/doanh-thu`);
    },
    getDonHang(){
      return privateApi.get(`${API_URL}/don-hang`);
    },
    getBinhLuan(){
      return privateApi.get(`${API_URL}/binh-luan`);
    }
};

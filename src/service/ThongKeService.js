import axios from 'axios';

const API_URL = 'http://localhost:8080/thong-ke'; // Đổi theo API backend của bạn

export default {
    getAllHoaDons() {
        return axios.get(`${API_URL}/hoa-don`);
    },
    getDoanhSo(){
      return axios.get(`${API_URL}/doanh-so`);
    },
    getDoanhThu(){
      return axios.get(`${API_URL}/doanh-thu`);
    },
    getDonHang(){
      return axios.get(`${API_URL}/don-hang`);
    },
    getBinhLuan(){
      return axios.get(`${API_URL}/binh-luan`);
    }
};

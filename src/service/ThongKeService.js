import axios from 'axios';

const API_URL = 'http://localhost:8080/thong-ke'; // Đổi theo API backend của bạn

export default {
    getAllHoaDons() {
        return axios.get(`${API_URL}/hoa-don`);
    },
    getDoanhSo(){
      return axios.get(`${API_URL}/doanh-so`);
    }
};

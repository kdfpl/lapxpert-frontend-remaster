import axios from 'axios';

const API_URL = 'http://localhost:8080/api/hoa-don'; // Đổi theo API backend của bạn

export default {
    getAllHoaDons() {
        return axios.get(API_URL);
    },

    getHoaDonById(id) {
        return axios.get(`${API_URL}/${id}`);
    },

    createHoaDon(hoaDon) {
        return axios.post(API_URL, hoaDon);
    },

    updateHoaDon(id, hoaDon) {
        return axios.put(`${API_URL}/${id}`, hoaDon);
    },


};

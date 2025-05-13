import {privateApi} from "./axiosAPI";
const API_URL = '/hoa-don'; // Đổi theo API backend của bạn

export default {
    getAllHoaDons() {
        return privateApi.get(API_URL);
    },

    getHoaDonById(id) {
        return privateApi.get(`${API_URL}/${id}`);
    },

    createHoaDon(hoaDon) {
        return privateApi.post(API_URL, hoaDon);
    },

    updateHoaDon(id, hoaDon) {
        return privateApi.put(`${API_URL}/${id}`, hoaDon);
    },
};




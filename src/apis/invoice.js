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

    // New function to get orders for the authenticated user
    getMyOrders() {
        return privateApi.get(`${API_URL}/me`);
    },

    // New function to get the history of a specific order
    getOrderHistory(orderId) {
        return privateApi.get(`${API_URL}/${orderId}/history`);
    },
};

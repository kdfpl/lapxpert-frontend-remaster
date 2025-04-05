import api from './axiosAPI'

const API_BASE_URL = '/user'

export default {
  getCustomers() {
    return api.get(`${API_BASE_URL}/customer`)
  },
  getCustomerById(id) {
    return api.get(`${API_BASE_URL}/customer/${id}`)
  },
  createCustomer(customerData) {
    return api.post(`${API_BASE_URL}/customer`, customerData)
  },
  updateCustomer(id, customerData) {
    return api.put(`${API_BASE_URL}/customer/${id}`, customerData)
  },
  deleteCustomer(id) {
    return api.delete(`${API_BASE_URL}/customer/${id}`)
  },
  restoreCustomer(id) {
    return api.post(`${API_BASE_URL}/customer/restore/${id}`)
  },

  getStaff() {
    return api.get(`${API_BASE_URL}/staff`)
  },
  getStaffById(id) {
    return api.get(`${API_BASE_URL}/staff/${id}`)
  },
  createStaff(staffData) {
    return api.post(`${API_BASE_URL}/staff`, staffData)
  },
  updateStaff(id, staffData) {
    return api.put(`${API_BASE_URL}/staff/${id}`, staffData)
  },
  deleteStaff(id) {
    return api.delete(`${API_BASE_URL}/staff/${id}`)
  },
  restoreStaff(id) {
    return api.post(`${API_BASE_URL}/staff/restore/${id}`)
  },
}
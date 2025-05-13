import {privateApi} from './axiosAPI'

const privateApi_BASE_URL = '/user'

export default {
  getCustomers() {
    return privateApi.get(`${privateApi_BASE_URL}/customer`)
  },
  getCustomerById(id) {
    return privateApi.get(`${privateApi_BASE_URL}/customer/${id}`)
  },
  createCustomer(customerData) {
    return privateApi.post(`${privateApi_BASE_URL}/customer`, customerData)
  },
  updateCustomer(id, customerData) {
    return privateApi.put(`${privateApi_BASE_URL}/customer/${id}`, customerData)
  },
  deleteCustomer(id) {
    return privateApi.delete(`${privateApi_BASE_URL}/customer/${id}`)
  },
  restoreCustomer(id) {
    return privateApi.post(`${privateApi_BASE_URL}/customer/restore/${id}`)
  },

  getStaff() {
    return privateApi.get(`${privateApi_BASE_URL}/staff`)
  },
  getStaffById(id) {
    return privateApi.get(`${privateApi_BASE_URL}/staff/${id}`)
  },
  createStaff(staffData) {
    return privateApi.post(`${privateApi_BASE_URL}/staff`, staffData)
  },
  updateStaff(id, staffData) {
    return privateApi.put(`${privateApi_BASE_URL}/staff/${id}`, staffData)
  },
  deleteStaff(id) {
    return privateApi.delete(`${privateApi_BASE_URL}/staff/${id}`)
  },
  restoreStaff(id) {
    return privateApi.post(`${privateApi_BASE_URL}/staff/restore/${id}`)
  },
}
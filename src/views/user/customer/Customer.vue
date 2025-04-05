<template>
    <div class="customer-list">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="Thêm khách hàng" icon="pi pi-plus" class="p-button-success mr-2" @click="goToAdd" />
        </template>
        <template #end>
          <ToggleButton v-model="showInactive" onLabel="Hiển thị không hoạt động" offLabel="Ẩn không hoạt động" 
                        class="w-25rem" />
        </template>
      </Toolbar>
  
      <UserTable
        :users="filteredCustomers"
        :loading="loading"
        title="Danh sách khách hàng"
        @edit="goToEdit"
        @delete="confirmDelete"
        @restore="confirmRestore"
      />
  
      <Toast />
      <ConfirmDialog />
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToast } from 'primevue/usetoast';
  import { useConfirm } from 'primevue/useconfirm';
  import { useCustomerStore } from '@/stores/customerStore';
  import UserTable from '@/components/UserTable.vue';
  import Toolbar from 'primevue/toolbar';
  import Button from 'primevue/button';
  import ToggleButton from 'primevue/togglebutton';
  import Toast from 'primevue/toast';
  import ConfirmDialog from 'primevue/confirmdialog';
  
  export default {
    components: {
      UserTable,
      Toolbar,
      Button,
      ToggleButton,
      Toast,
      ConfirmDialog
    },
    setup() {
      const router = useRouter();
      const toast = useToast();
      const confirm = useConfirm();
      const customerStore = useCustomerStore();
      const showInactive = ref(false);
      const loading = ref(false);
  
      // Load customers on mount
      onMounted(async () => {
        loading.value = true;
        try {
          await customerStore.fetchCustomers();
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể tải danh sách khách hàng',
            life: 3000
          });
        } finally {
          loading.value = false;
        }
      });
  
      // Computed properties
      const filteredCustomers = computed(() => {
        return showInactive.value 
          ? [...customerStore.activeCustomers, ...customerStore.inactiveCustomers]
          : customerStore.activeCustomers;
      });
  
      // Navigation methods
      const goToAdd = () => {
        router.push({ name: 'CustomerAdd' });
      };
  
      const goToEdit = (customer) => {
        router.push({ name: 'CustomerEdit', params: { id: customer.id } });
      };
  
      // Delete confirmation
      const confirmDelete = (customer) => {
        confirm.require({
          message: `Bạn có chắc chắn muốn vô hiệu hóa khách hàng ${customer.hoTen}?`,
          header: 'Xác nhận',
          icon: 'pi pi-exclamation-triangle',
          accept: () => deleteCustomer(customer.id)
        });
      };
  
      const deleteCustomer = async (id) => {
        try {
          await customerStore.deleteCustomer(id);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Khách hàng đã được vô hiệu hóa',
            life: 3000
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể vô hiệu hóa khách hàng',
            life: 3000
          });
        }
      };
  
      // Restore confirmation
      const confirmRestore = (customer) => {
        confirm.require({
          message: `Bạn có chắc chắn muốn khôi phục khách hàng ${customer.hoTen}?`,
          header: 'Xác nhận',
          icon: 'pi pi-exclamation-triangle',
          accept: () => restoreCustomer(customer.id)
        });
      };
  
      const restoreCustomer = async (id) => {
        try {
          await customerStore.restoreCustomer(id);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Khách hàng đã được khôi phục',
            life: 3000
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể khôi phục khách hàng',
            life: 3000
          });
        }
      };
  
      return {
        showInactive,
        loading,
        filteredCustomers,
        goToAdd,
        goToEdit,
        confirmDelete,
        confirmRestore
      };
    }
  };
  </script>
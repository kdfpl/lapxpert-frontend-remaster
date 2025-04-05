<template>
    <div class="staff-list">
      <Toolbar class="mb-4">
        <template #start>
          <Button label="Thêm nhân viên" icon="pi pi-plus" class="p-button-success mr-2" @click="goToAdd" />
        </template>
        <template #end>
          <ToggleButton v-model="showInactive" onLabel="Hiển thị không hoạt động" offLabel="Ẩn không hoạt động" 
                        class="w-25rem" />
        </template>
      </Toolbar>
  
      <UserTable
        :users="filteredStaff"
        :loading="loading"
        :showStaffFields="true"
        title="Danh sách nhân viên"
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
  import { useStaffStore } from '@/stores/staffStore';
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
      const staffStore = useStaffStore();
      const showInactive = ref(false);
      const loading = ref(false);
  
      // Load staff on mount
      onMounted(async () => {
        loading.value = true;
        try {
          await staffStore.fetchStaff();
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể tải danh sách nhân viên',
            life: 3000
          });
        } finally {
          loading.value = false;
        }
      });
  
      // Computed properties
      const filteredStaff = computed(() => {
        return showInactive.value 
          ? [...staffStore.activeStaff, ...staffStore.inactiveStaff]
          : staffStore.activeStaff;
      });
  
      // Navigation methods
      const goToAdd = () => {
        router.push({ name: 'StaffAdd' });
      };
  
      const goToEdit = (staff) => {
        router.push({ name: 'StaffEdit', params: { id: staff.id } });
      };
  
      // Delete confirmation
      const confirmDelete = (staff) => {
        confirm.require({
          message: `Bạn có chắc chắn muốn vô hiệu hóa nhân viên ${staff.hoTen}?`,
          header: 'Xác nhận',
          icon: 'pi pi-exclamation-triangle',
          accept: () => deleteStaff(staff.id)
        });
      };
  
      const deleteStaff = async (id) => {
        try {
          await staffStore.deleteStaff(id);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Nhân viên đã được vô hiệu hóa',
            life: 3000
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể vô hiệu hóa nhân viên',
            life: 3000
          });
        }
      };
  
      // Restore confirmation
      const confirmRestore = (staff) => {
        confirm.require({
          message: `Bạn có chắc chắn muốn khôi phục nhân viên ${staff.hoTen}?`,
          header: 'Xác nhận',
          icon: 'pi pi-exclamation-triangle',
          accept: () => restoreStaff(staff.id)
        });
      };
  
      const restoreStaff = async (id) => {
        try {
          await staffStore.restoreStaff(id);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Nhân viên đã được khôi phục',
            life: 3000
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: error.message || 'Không thể khôi phục nhân viên',
            life: 3000
          });
        }
      };
  
      return {
        showInactive,
        loading,
        filteredStaff,
        goToAdd,
        goToEdit,
        confirmDelete,
        confirmRestore
      };
    }
  };
  </script>
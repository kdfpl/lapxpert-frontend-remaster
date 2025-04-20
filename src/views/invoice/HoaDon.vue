<template>
    <div class="invoice-list">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="Thêm hóa đơn" icon="pi pi-plus" class="mr-2" @click="goToAdd" />
                <Button label="In" icon="pi pi-print" class="mr-2" severity="secondary" @click="printPDF" />
                <Button label="Xuất" icon="pi pi-upload" class="mr-2" severity="secondary" @click="exportExcel" />
            </template>
            <template #end>
                <ToggleButton v-model="showInactive" onLabel="Hiển thị không hoạt động" offLabel="Ẩn không hoạt động"
                    class="w-25rem" />
            </template>
        </Toolbar>

        <InvoiceTable :invoices="filteredInvoices" :loading="loading" title="Danh sách hóa đơn" @edit="goToEdit"
            @delete="confirmDelete" @restore="confirmRestore" ref="invoiceTable" />

        <Toast />
        <ConfirmDialog />
    </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import InvoiceTable from '@/components/InvoiceTable.vue'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import ToggleButton from 'primevue/togglebutton'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import * as XLSX from 'xlsx'


export default {
    components: {
        InvoiceTable,
        Toolbar,
        Button,
        ToggleButton,
        Toast,
        ConfirmDialog,
    },
    setup() {
        const toast = useToast()
        const showInactive = ref(false)
        const loading = ref(false)
        const invoiceTable = ref(null)

        // ✅ Khai báo store nếu đang dùng Pinia

        // ✅ Dữ liệu hóa đơn được lọc (ẩn/hiện không hoạt động)
        const invoices = ref([])

        onMounted(async () => {
            const res = await fetch('/api/hoa-don') // hoặc gọi qua axios
            invoices.value = await res.json()
        })

        const filteredInvoices = computed(() => {
            return invoices.value.filter(inv =>
                showInactive.value ? true : inv.trangThai === true
            )
        })


        const formatDate = (dateStr) => {
            const date = new Date(dateStr)
            return date.toLocaleDateString('vi-VN')
        }

        const exportExcel = () => {
            try {
                const invoices = filteredInvoices.value

                const exportData = invoices.map((inv) => ({
                    'ID': inv.id,
                    'Mã Hóa Đơn': inv.maHoaDon,
                    'Khách Hàng': inv.khachHang?.hoTen || 'N/A',
                    'Tổng Tiền': inv.tongTien?.toLocaleString() || '',
                    'Ngày Đặt': formatDate(inv.ngayDat),
                    'Trạng Thái': inv.trangThai ? 'Hoạt động' : 'Không hoạt động',
                }))

                const worksheet = XLSX.utils.json_to_sheet(exportData)
                const workbook = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Hóa Đơn')

                const now = new Date()
                const fileName = `danh_sach_hoa_don_${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}.xlsx`
                XLSX.writeFile(workbook, fileName)

                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất Excel thành công', life: 3000 })
            } catch (err) {
                toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xuất Excel', life: 3000 })
            }
        }

        const printPDF = () => {
            try {
                const invoices = filteredInvoices.value

                const printWindow = window.open('', '_blank')
                if (!printWindow) {
                    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Trình duyệt đã chặn cửa sổ in.', life: 3000 })
                    return
                }

                let htmlContent = `
        <html>
        <head>
            <title>Danh sách Hóa Đơn</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    margin: 20px;
                    color: #000;
                }

                .header {
                    text-align: center;
                    margin-bottom: 10px;
                }

                .logo {
                    width: 100px;
                    height: auto;
                    margin-bottom: 10px;
                }

                .shop-info {
                    text-align: center;
                    line-height: 1.5;
                    margin-bottom: 10px;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                }

                h2.title {
                    text-align: center;
                    margin-top: 20px;
                    margin-bottom: 20px;
                    font-size: 22px;
                    font-weight: bold;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th {
                    background-color: #f2f2f2;
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: center;
                }

                td {
                    padding: 10px;
                    border: 1px solid #ddd;
                    text-align: center;
                }

                .footer {
                    text-align: center;
                    margin-top: 40px;
                    font-style: italic;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="" alt="Logo" class="logo" />
            </div>

            <div class="shop-info">
                <p><strong>LAPXPERT</strong></p>
                <p>Địa chỉ: 456 CẦU GIẤY, Thành phố HÀ NỘI</p>
                <p>SĐT: (012) 345-6789</p>
                <p>Email: lapxpertlaptop@gmail.com</p>
            </div>

            <h2 class="title">DANH SÁCH HÓA ĐƠN</h2>
            <p style="text-align: center;">Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>

            <table>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã Hóa Đơn</th>
                        <th>Khách Hàng</th>
                        <th>Địa Chỉ</th>
                        <th>Tổng Thanh Toán</th>
                        <th>Ngày Tạo</th>
                        <th>Trạng Thái</th>
                        <th>Loại Đơn Hàng</th>
                    </tr>
                </thead>
                <tbody>`

                invoices.forEach(inv => {
                    htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${inv.maHoaDon}</td>
                    <td>${inv.khachHang?.ten || inv.khachHangId}</td>
                    <td>${[
                            inv.diaChiGiaoHangDuong,
                            inv.diaChiGiaoHangPhuongXa,
                            inv.diaChiGiaoHangQuanHuyen,
                            inv.diaChiGiaoHangTinhThanh
                        ].filter(Boolean).join(', ') || 'N/A'}</td>
                    <td>${inv.tongThanhToan?.toLocaleString() || ''}</td>
                    <td>${formatDate(inv.ngayTao)}</td>
                    <td>${inv.trangThaiGiaoHang ? 'Đã giao' : 'Chưa giao'}</td>
                    <td>${inv.loaiDonHang ? 'Online' : 'Tại quầy'}</td>
                </tr>`;
                });

                htmlContent += `
                </tbody>
            </table>

            <div class="footer">
                <p>Cảm ơn quý khách và hẹn gặp lại ❤️</p>
            </div>
        </body>
        </html>`

                printWindow.document.open()
                printWindow.document.write(htmlContent)
                printWindow.document.close()

                printWindow.onload = () => {
                    printWindow.focus()
                    printWindow.print()
                }

                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã mở trang in', life: 3000 })
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể in', life: 3000 })
            }
        }


        onMounted(async () => {
            loading.value = true
            try {
                await invoiceStore.fetchInvoices()
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải hóa đơn', life: 3000 })
            } finally {
                loading.value = false
            }
        })

        return {
            showInactive,
            loading,
            exportExcel,
            printPDF,
            invoiceTable,
            filteredInvoices,
        }
    }
}
</script>

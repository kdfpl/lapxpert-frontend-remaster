import { defineStore } from 'pinia';
import attributeService from '@/apis/attributes';

export const useAttributeStore = defineStore('attributes', {
    state: () => ({
        audio: [],
        keyboard: [],
        security: [],
        interface: [],
        cpu: [],
        gpu: [],
        os: [],
        network: [],
        screen: [],
        storage: [],
        battery: [],
        ram: [],
        design: [],
        webcam: [],
        brand: [],
        category: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchAudio() {
            try {
                this.loading = true;
                const response = await attributeService.getAllAudio();
                this.audio = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching audio:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchKeyboard() {
            try {
                this.loading = true;
                const response = await attributeService.getAllKeyboard();
                this.keyboard = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching keyboard:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchSecurity() {
            try {
                this.loading = true;
                const response = await attributeService.getAllSecurity();
                this.security = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching security:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchInterface() {
            try {
                this.loading = true;
                const response = await attributeService.getAllInterface();
                this.interface = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching interface:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchCpu() {
            try {
                this.loading = true;
                const response = await attributeService.getAllCpu();
                this.cpu = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching CPU:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchGpu() {
            try {
                this.loading = true;
                const response = await attributeService.getAllGpu();
                this.gpu = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching GPU:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchOs() {
            try {
                this.loading = true;
                const response = await attributeService.getAllOs();
                this.os = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching OS:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchNetwork() {
            try {
                this.loading = true;
                const response = await attributeService.getAllNetwork();
                this.network = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching network:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchScreen() {
            try {
                this.loading = true;
                const response = await attributeService.getAllScreen();
                this.screen = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching screen:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchStorage() {
            try {
                this.loading = true;
                const response = await attributeService.getAllStorage();
                this.storage = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching storage:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchBattery() {
            try {
                this.loading = true;
                const response = await attributeService.getAllBattery();
                this.battery = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching battery:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchRam() {
            try {
                this.loading = true;
                const response = await attributeService.getAllRam();
                this.ram = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching RAM:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchDesign() {
            try {
                this.loading = true;
                const response = await attributeService.getAllDesign();
                this.design = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching design:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchWebcam() {
            try {
                this.loading = true;
                const response = await attributeService.getAllWebcam();
                this.webcam = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching webcam:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchBrand() {
            try {
                this.loading = true;
                const response = await attributeService.getAllBrand();
                this.brand = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching brand:', error);
            } finally {
                this.loading = false;
            }
        },

        async fetchCategory() {
            try {
                this.loading = true;
                const response = await attributeService.getAllCategory();
                this.category = response.data;
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching category:', error);
            } finally {
                this.loading = false;
            }
        },

        // Utility action to fetch all attributes at once
        async fetchAllAttributes() {
            await Promise.all([
                this.fetchAudio(),
                this.fetchKeyboard(),
                this.fetchSecurity(),
                this.fetchInterface(),
                this.fetchCpu(),
                this.fetchGpu(),
                this.fetchOs(),
                this.fetchNetwork(),
                this.fetchScreen(),
                this.fetchStorage(),
                this.fetchBattery(),
                this.fetchRam(),
                this.fetchDesign(),
                this.fetchWebcam(),
                this.fetchBrand(),
                this.fetchCategory()
            ]);
        },

        // Reset error state
        clearError() {
            this.error = null;
        }
    },

    getters: {
        isLoading: (state) => state.loading,
        hasError: (state) => state.error !== null,
        getError: (state) => state.error
    }
});
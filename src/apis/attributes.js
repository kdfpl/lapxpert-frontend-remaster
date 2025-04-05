import api from "./axiosAPI";

const API_URL = "/products/attributes";

const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
};

const attributeService = {
  // Audio
  getAllAudio: async () => {
    try {
      return await api.get(`${API_URL}/audio`);
    } catch (error) {
      return handleError(error);
    }
  },
  createAudio: async (audio) => {
    try {
      return await api.put(`${API_URL}/audio`, audio);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleAudio: async (audios) => {
    try {
      return await api.put(`${API_URL}/audio/multiple`, audios);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteAudio: async (id) => {
    try {
      return await api.delete(`${API_URL}/audio/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleAudio: async (ids) => {
    try {
      return await api.delete(`${API_URL}/audio`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Keyboard
  getAllKeyboard: async () => {
    try {
      return await api.get(`${API_URL}/keyboard`);
    } catch (error) {
      return handleError(error);
    }
  },
  createKeyboard: async (keyboard) => {
    try {
      return await api.put(`${API_URL}/keyboard`, keyboard);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleKeyboard: async (keyboards) => {
    try {
      return await api.put(`${API_URL}/keyboard/multiple`, keyboards);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteKeyboard: async (id) => {
    try {
      return await api.delete(`${API_URL}/keyboard/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleKeyboard: async (ids) => {
    try {
      return await api.delete(`${API_URL}/keyboard`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Security
  getAllSecurity: async () => {
    try {
      return await api.get(`${API_URL}/security`);
    } catch (error) {
      return handleError(error);
    }
  },
  createSecurity: async (security) => {
    try {
      return await api.put(`${API_URL}/security`, security);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleSecurity: async (securities) => {
    try {
      return await api.put(`${API_URL}/security/multiple`, securities);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteSecurity: async (id) => {
    try {
      return await api.delete(`${API_URL}/security/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleSecurity: async (ids) => {
    try {
      return await api.delete(`${API_URL}/security`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Interface
  getAllInterface: async () => {
    try {
      return await api.get(`${API_URL}/interface`);
    } catch (error) {
      return handleError(error);
    }
  },
  createInterface: async (interface_) => {
    try {
      return await api.put(`${API_URL}/interface`, interface_);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleInterface: async (interfaces) => {
    try {
      return await api.put(`${API_URL}/interface/multiple`, interfaces);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteInterface: async (id) => {
    try {
      return await api.delete(`${API_URL}/interface/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleInterface: async (ids) => {
    try {
      return await api.delete(`${API_URL}/interface`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // CPU
  getAllCpu: async () => {
    try {
      return await api.get(`${API_URL}/cpu`);
    } catch (error) {
      return handleError(error);
    }
  },
  createCpu: async (cpu) => {
    try {
      return await api.put(`${API_URL}/cpu`, cpu);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleCpu: async (cpus) => {
    try {
      return await api.put(`${API_URL}/cpu/multiple`, cpus);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteCpu: async (id) => {
    try {
      return await api.delete(`${API_URL}/cpu/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleCpu: async (ids) => {
    try {
      return await api.delete(`${API_URL}/cpu`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // GPU
  getAllGpu: async () => {
    try {
      return await api.get(`${API_URL}/gpu`);
    } catch (error) {
      return handleError(error);
    }
  },
  createGpu: async (gpu) => {
    try {
      return await api.put(`${API_URL}/gpu`, gpu);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleGpu: async (gpus) => {
    try {
      return await api.put(`${API_URL}/gpu/multiple`, gpus);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteGpu: async (id) => {
    try {
      return await api.delete(`${API_URL}/gpu/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleGpu: async (ids) => {
    try {
      return await api.delete(`${API_URL}/gpu`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Operating System
  getAllOs: async () => {
    try {
      return await api.get(`${API_URL}/os`);
    } catch (error) {
      return handleError(error);
    }
  },
  createOs: async (os) => {
    try {
      return await api.put(`${API_URL}/os`, os);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleOs: async (osList) => {
    try {
      return await api.put(`${API_URL}/os/multiple`, osList);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteOs: async (id) => {
    try {
      return await api.delete(`${API_URL}/os/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleOs: async (ids) => {
    try {
      return await api.delete(`${API_URL}/os`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Network
  getAllNetwork: async () => {
    try {
      return await api.get(`${API_URL}/network`);
    } catch (error) {
      return handleError(error);
    }
  },
  createNetwork: async (network) => {
    try {
      return await api.put(`${API_URL}/network`, network);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleNetwork: async (networks) => {
    try {
      return await api.put(`${API_URL}/network/multiple`, networks);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteNetwork: async (id) => {
    try {
      return await api.delete(`${API_URL}/network/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleNetwork: async (ids) => {
    try {
      return await api.delete(`${API_URL}/network`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Screen
  getAllScreen: async () => {
    try {
      return await api.get(`${API_URL}/screen`);
    } catch (error) {
      return handleError(error);
    }
  },
  createScreen: async (screen) => {
    try {
      return await api.put(`${API_URL}/screen`, screen);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleScreen: async (screens) => {
    try {
      return await api.put(`${API_URL}/screen/multiple`, screens);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteScreen: async (id) => {
    try {
      return await api.delete(`${API_URL}/screen/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleScreen: async (ids) => {
    try {
      return await api.delete(`${API_URL}/screen`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Storage
  getAllStorage: async () => {
    try {
      return await api.get(`${API_URL}/storage`);
    } catch (error) {
      return handleError(error);
    }
  },
  createStorage: async (storage) => {
    try {
      return await api.put(`${API_URL}/storage`, storage);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleStorage: async (storages) => {
    try {
      return await api.put(`${API_URL}/storage/multiple`, storages);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteStorage: async (id) => {
    try {
      return await api.delete(`${API_URL}/storage/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleStorage: async (ids) => {
    try {
      return await api.delete(`${API_URL}/storage`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Battery
  getAllBattery: async () => {
    try {
      return await api.get(`${API_URL}/battery`);
    } catch (error) {
      return handleError(error);
    }
  },
  createBattery: async (battery) => {
    try {
      return await api.put(`${API_URL}/battery`, battery);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleBattery: async (batteries) => {
    try {
      return await api.put(`${API_URL}/battery/multiple`, batteries);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteBattery: async (id) => {
    try {
      return await api.delete(`${API_URL}/battery/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleBattery: async (ids) => {
    try {
      return await api.delete(`${API_URL}/battery`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // RAM
  getAllRam: async () => {
    try {
      return await api.get(`${API_URL}/ram`);
    } catch (error) {
      return handleError(error);
    }
  },
  createRam: async (ram) => {
    try {
      return await api.put(`${API_URL}/ram`, ram);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleRam: async (rams) => {
    try {
      return await api.put(`${API_URL}/ram/multiple`, rams);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteRam: async (id) => {
    try {
      return await api.delete(`${API_URL}/ram/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleRam: async (ids) => {
    try {
      return await api.delete(`${API_URL}/ram`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Design
  getAllDesign: async () => {
    try {
      return await api.get(`${API_URL}/design`);
    } catch (error) {
      return handleError(error);
    }
  },
  createDesign: async (design) => {
    try {
      return await api.put(`${API_URL}/design`, design);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleDesign: async (designs) => {
    try {
      return await api.put(`${API_URL}/design/multiple`, designs);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteDesign: async (id) => {
    try {
      return await api.delete(`${API_URL}/design/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleDesign: async (ids) => {
    try {
      return await api.delete(`${API_URL}/design`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Webcam
  getAllWebcam: async () => {
    try {
      return await api.get(`${API_URL}/webcam`);
    } catch (error) {
      return handleError(error);
    }
  },
  createWebcam: async (webcam) => {
    try {
      return await api.put(`${API_URL}/webcam`, webcam);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleWebcam: async (webcams) => {
    try {
      return await api.put(`${API_URL}/webcam/multiple`, webcams);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteWebcam: async (id) => {
    try {
      return await api.delete(`${API_URL}/webcam/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleWebcam: async (ids) => {
    try {
      return await api.delete(`${API_URL}/webcam`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Brand
  getAllBrand: async () => {
    try {
      return await api.get(`${API_URL}/brands`);
    } catch (error) {
      return handleError(error);
    }
  },
  createBrand: async (brand) => {
    try {
      return await api.put(`${API_URL}/brands`, brand);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleBrand: async (brands) => {
    try {
      return await api.put(`${API_URL}/brands/multiple`, brands);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteBrand: async (id) => {
    try {
      return await api.delete(`${API_URL}/brands/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleBrand: async (ids) => {
    try {
      return await api.delete(`${API_URL}/brands`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },

  // Category
  getAllCategory: async () => {
    try {
      return await api.get(`${API_URL}/categories`);
    } catch (error) {
      return handleError(error);
    }
  },
  createCategory: async (category) => {
    try {
      return await api.put(`${API_URL}/categories`, category);
    } catch (error) {
      return handleError(error);
    }
  },
  createMultipleCategory: async (categories) => {
    try {
      return await api.put(`${API_URL}/categories/multiple`, categories);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteCategory: async (id) => {
    try {
      return await api.delete(`${API_URL}/categories/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
  deleteMultipleCategory: async (ids) => {
    try {
      return await api.delete(`${API_URL}/categories`, { data: ids });
    } catch (error) {
      return handleError(error);
    }
  },
}

export default attributeService;
import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3100/api',
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;

export const login = (phone: string, code: string) => request.post('/member/login', { phone, code });
export const getProfile = () => request.get('/member/profile');
export const getQrcode = () => request.get('/member/qrcode');
export const getCategories = () => request.get('/products/categories');
export const getProducts = (params?: any) => request.get('/products', { params });
export const getProduct = (id: number) => request.get(`/products/${id}`);
export const getMerchants = () => request.get('/merchants');
export const getMerchant = (id: number) => request.get(`/merchants/${id}`);
export const getActivities = (params?: any) => request.get('/activities', { params });
export const getActivity = (id: number) => request.get(`/activities/${id}`);
export const getAnnouncements = () => request.get('/announcements');
export const getCouponTemplates = () => request.get('/coupons/available');
export const claimCoupon = (id: number) => request.post(`/coupons/${id}/claim`);
export const getMemberCoupons = () => request.get('/member/coupons');
export const getPointsLog = (params?: any) => request.get('/points/log', { params });
export const getCheckinStatus = () => request.get('/points/checkin/status');
export const checkin = () => request.post('/points/checkin');
export const getVehicles = () => request.get('/vehicles');
export const addVehicle = (plate_number: string, plate_color?: string) => request.post('/vehicles', { plate_number, plate_color });
export const deleteVehicle = (id: number) => request.delete(`/vehicles/${id}`);
export const setDefaultVehicle = (id: number) => request.put(`/vehicles/${id}/default`);
export const queryParking = (plateNumber: string) => request.get('/parking/query', { params: { plate_number: plateNumber } });
export const getParkingRecords = (params?: any) => request.get('/parking/records', { params });
export const deductParking = (data: any) => request.post('/parking/deduct', data);
export const getConfig = () => request.get('/config');

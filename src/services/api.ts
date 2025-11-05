import axios from "axios";

// Prod veya local backend URL
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";

export const getShopifyOrders = async (shop: string) => {
  return axios.get(`${API_URL}/shopify/orders?shop=${shop}&status=any`);
};

export const createMNGShipment = async (data: {
  shop: string;
  orderId: string;
  courier: string;
  isReturn?: boolean;
  orderData: any; // frontend’den gelen orderData
}) => {
  return axios.post(`${API_URL}/shipments`, data);
};

export const createIndividualMNGShipment = async (
  orderData: any,
  courier: string
) => {
  // Bireysel gönderimde sahte orderId oluştur
  const fakeOrderId = Date.now().toString();

  return axios.post(`${API_URL}/shipments`, {
    orderId: fakeOrderId,
    courier,
    isReturn: false,
    orderData,
  });
};

export const getShipmentsByOrderIds = async (orderIds: string) => {
  // orderIds virgülle ayrılmış string: "123,124,125"
  return axios.get(`${API_URL}/shipments?orderIds=${orderIds}`);
};

export const checkReturnOrder = async (criteria: {
  referenceId?: string;
  shipmentId?: string;
  invoiceNumber?: string;
  barcode?: string;
}) => {
  return axios.post(`${API_URL}/returns/check`, criteria);
};

export const getReturns = async () => {
  return axios.get(`${API_URL}/returns`);
};

export const createReturn = async (data: {
  order: string;
  customer?: string;
  reason: string;
}) => {
  return axios.post(`${API_URL}/returns`, data);
};

export const updateReturnStatus = async (id: string, status: string) => {
  return axios.patch(`${API_URL}/returns/${id}`, { status });
};

export const createShipment = async (data: {
  returnId: string;
  courier: string;
}) => {
  return axios.post(`${API_URL}/shipments`, data);
};

export const getShipment = async (id: string) => {
  return axios.get(`${API_URL}/shipments/${id}`);
};

// 🔹 CBS şehir/ilçe servisleri
export const getCities = async () => {
  return axios.get(`${API_URL}/cbs/cities`);
};

export const getDistrictsByCityCode = async (cityCode: string) => {
  return axios.get(`${API_URL}/cbs/districts/${cityCode}`);
};

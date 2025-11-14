import axios from "axios";

// Backend URL (prod veya local)
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3003";

/* ================================
   🔹 TYPE DEFINITIONS
================================ */
export interface ShipmentResponse {
  trackingNumber: string;
  labelUrl: string;
  barcode: string;
  raw?: any;
}

/* ================================
   🔹 SHOPIFY SERVİSLERİ
================================ */
export const getShopifyOrders = async () => {
  return axios.get(`${API_URL}/shopify/orders?status=any`);
};

export const createShopifyFulfillment = async (orderId: string, trackingNumber: string) => {
  return axios.post(`${API_URL}/shopify/fulfillment`, { orderId, trackingNumber });
};

/* ================================
   🔹 MNG KARGO / GÖNDERİ SERVİSLERİ
================================ */
export const createMNGShipment = async (data: {
  orderId: string;
  courier: string;
  isReturn?: boolean;
  orderData: any;
  cityName?: string;
  districtName?: string;
  cityCode?: number;
  districtCode?: number;
}): Promise<ShipmentResponse> => {
  const res = await axios.post(`${API_URL}/shipments`, data);
  const d = res.data;
  return {
    trackingNumber: d.trackingNumber || '',
    labelUrl: d.labelUrl || '',
    barcode: d.barcode || '',
    raw: d,
  };
};

export const createIndividualMNGShipment = async (orderData: any, courier: string): Promise<ShipmentResponse> => {
  const fakeOrderId = Date.now().toString();
  const res = await axios.post(`${API_URL}/shipments`, {
    orderId: fakeOrderId,
    courier,
    isReturn: false,
    orderData,
  });
  const d = res.data;
  return {
    trackingNumber: d.trackingNumber || '',
    labelUrl: d.labelUrl || '',
    barcode: d.barcode || '',
    raw: d,
  };
};

export const getShipmentsByOrderIds = async (orderIds: string) => {
  return axios.get(`${API_URL}/shipments?orderIds=${orderIds}`);
};

/* ================================
   🔹 İADE / RETURN SERVİSLERİ
================================ */
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

/* ================================
   🔹 TEKİL KARGO SERVİSLERİ
================================ */
export const createShipment = async (data: { returnId: string; courier: string }) => {
  return axios.post(`${API_URL}/shipments`, data);
};

export const getShipment = async (id: string) => {
  return axios.get(`${API_URL}/shipments/${id}`);
};

/* ================================
   🔹 CBS (ŞEHİR / İLÇE) SERVİSLERİ
================================ */
export const getCities = async () => {
  return axios.get(`${API_URL}/cbs/cities`);
};

export const getDistrictsByCityCode = async (cityCode: string) => {
  return axios.get(`${API_URL}/cbs/districts/${cityCode}`);
};

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
export interface GetShopifyOrdersParams {
  financial_status?: 'paid';
  fulfillment_status?: 'unfulfilled';
  status?: 'any';
  limit?: number;
}

export const getShopifyOrders = async (params?: GetShopifyOrdersParams) => {
  console.log('🔍 API İsteği gönderiliyor:', `${API_URL}/shopify/orders`, params);
  
  const response = await axios.get(`${API_URL}/shopify/orders`, { params });
  
  console.log('✅ API Yanıtı alındı:', {
    success: response.data.success,
    totalOrders: response.data.data?.length || 0,
    firstOrder: response.data.data?.[0] || null
  });
  
  // İlk 3 siparişin adres bilgilerini detaylı logla
  if (response.data.data && response.data.data.length > 0) {
    console.log('📦 İlk 3 sipariş adresleri:');
    response.data.data.slice(0, 3).forEach((order: any, index: number) => {
      console.log(`  ${index + 1}. Sipariş #${order.name}:`);
      console.log('     shipping_address:', order.shipping_address);
      console.log('     customer:', order.customer);
    });
  }
  
  return response;
};

export const createShopifyFulfillment = async (orderId: string, trackingNumber: string) => {
  return axios.post(`${API_URL}/shopify/fulfillment`, { orderId, trackingNumber });
};

/* ================================
   🔹 MNG KARGO / GÖNDERİ SERVİSLERİ
================================ */
export const createMNGShipment = async (data: {
  orderId: string;
  shopifyOrderId: string;
  shop: string;
  courier: string;
  isReturn?: boolean;
  orderData: any;
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
  console.log('🔍 Shipment sorgusu:', `${API_URL}/shipments?orderIds=${orderIds}`);
  
  const response = await axios.get(`${API_URL}/shipments?orderIds=${orderIds}`);
  
  console.log('✅ Shipment yanıtı:', {
    success: response.data.success,
    count: response.data.count,
    totalShipments: response.data.data?.length || 0
  });
  
  return response;
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
import axios from 'axios';

const API_URL = 'http://localhost:3003';

export const getShopifyOrders = async () => {
  return axios.get(`${API_URL}/shipments/orders`);
};

export const createMNGShipment = async (data: { orderId: string; courier: string }) => {
  return axios.post(`${API_URL}/shipments/mng`, data);
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
import React, { useState, useEffect } from 'react';
import { Button, Select, message, Typography } from 'antd';
import { createMNGShipment, getCities, getDistrictsByCityCode } from '@/services/api';

const { Option } = Select;
const { Paragraph, Link } = Typography;

// ------------------ Tip Tanımlamaları ------------------

interface LineItem {
  title: string;
  name?: string;
  quantity?: number;
}

interface Order {
  id: string;
  name: string;
  total_price: string;
  financial_status?: string; // Shopify payment status
  line_items?: LineItem[];
  customer: {
    name: string;
    email?: string;
    phone?: string;
    cityName?: string;
    districtName?: string;
    address?: string;
  };
}

interface Props {
  order: Order;
  isReturn?: boolean;
  onShipmentCreated?: (orderId: string, trackingNumber: string, labelUrl: string, barcode?: string) => void;
}

interface City {
  code: string;
  name: string;
}

interface District {
  code: string;
  name: string;
}

interface ShipmentResponse {
  trackingNumber: string;
  labelUrl: string;
  barcode: string;
  raw?: any;
}

// ------------------ Yardımcı Fonksiyonlar ------------------

const normalizeCityName = (str: string = '') =>
  str.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleUpperCase('tr-TR');

const formatDisplayName = (name: string = '') =>
  name
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');

// ------------------ Component ------------------

export default function MNGShipmentForm({ order, isReturn = false, onShipmentCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [courier, setCourier] = useState('MNG');
  const [paymentType, setPaymentType] = useState<number>(1);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [labelUrl, setLabelUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // ------------------ Şehir ve İlçe Yükleme ------------------

  useEffect(() => { fetchCities(); }, []);

  useEffect(() => {
    if (!cities.length) return;
    const normalizedCustomerCity = normalizeCityName(order.customer.cityName);
    const foundCity = cities.find(c => normalizeCityName(c.name) === normalizedCustomerCity);
    if (foundCity) {
      setSelectedCity(foundCity.name);
      fetchDistricts(foundCity.code);
    }
  }, [cities]);

  useEffect(() => {
    if (!districts.length || !order.customer.districtName) return;
    const normalizedDistrict = normalizeCityName(order.customer.districtName);
    const foundDistrict = districts.find(d => normalizeCityName(d.name) === normalizedDistrict);
    if (foundDistrict) setSelectedDistrict(foundDistrict.name);
  }, [districts]);

  useEffect(() => {
    if (order.financial_status) {
      const status = order.financial_status.toLowerCase();
      if (status === 'paid') setPaymentType(1);
      else if (status === 'pending') setPaymentType(2);
      else setPaymentType(1);
    }
  }, [order]);

  const fetchCities = async () => {
    try {
      const res = await getCities();
      const cityList: City[] = (res.data?.data || res.data || []).map((c: any) => ({
        ...c,
        name: formatDisplayName(c.name),
      }));
      setCities(cityList);
    } catch (err) {
      console.error('Şehirler alınamadı', err);
      message.error('Şehirler alınamadı.');
    }
  };

  const fetchDistricts = async (cityCode: string) => {
    setLoadingDistricts(true);
    try {
      const res = await getDistrictsByCityCode(cityCode);
      const districtList: District[] = (res.data?.data || res.data || []).map((d: any) => ({
        ...d,
        name: formatDisplayName(d.name),
      }));
      setDistricts(districtList);
    } catch (err) {
      console.error('İlçeler alınamadı', err);
      message.error('İlçeler alınamadı.');
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedDistrict('');
    const city = cities.find(c => c.name === value);
    if (city) fetchDistricts(city.code);
  };

  // ------------------ Shipment + Barcode Oluşturma ------------------

  const handleCreateShipment = async () => {
    if (!order.customer.name?.trim()) return message.warning('Müşteri adı soyadı boş. Lütfen önce doldurun.');
    if (!courier) return message.warning('Kargo firması seçin.');
    if (!selectedCity) return message.warning('Lütfen şehir seçin.');
    if (!selectedDistrict) return message.warning('Lütfen ilçe seçin.');
    if (!paymentType) return message.warning('Lütfen ödeme türünü seçin.');

    setLoading(true);
    try {
      const city = cities.find(c => c.name === selectedCity);
      const district = districts.find(d => d.name === selectedDistrict);

      const recipientPayload: any = {
        customerId: '',
        refCustomerId: '',
        cityCode: city?.code || 0,
        districtCode: district?.code || 0,
        cityName: selectedCity,
        districtName: selectedDistrict,
        address: order.customer.address || '',
        email: order.customer.email || '',
        mobilePhoneNumber: order.customer.phone || '',
      };

      // customerId > 0 ise fullName ekle, 0 veya null ise ekleme
      if (recipientPayload.customerId && recipientPayload.customerId > 0) {
        recipientPayload.fullName = order.customer.name;
      }

      const orderData = {
        referenceId: order.id,
        content: `Sipariş: ${order.name}`,
        paymentType,
        recipient: recipientPayload,
        pieces: order.line_items?.map((item: LineItem, idx: number) => ({
          desi: 2,
          kg: item.quantity || 1,
          content: item.title || item.name || 'Ürün',
        })) || [{ desi: 2, kg: 1, content: 'Varsayılan Paket' }],
      };

      const data: ShipmentResponse = await createMNGShipment({
        orderId: order.id,
        courier,
        isReturn,
        orderData,
      });

      setTrackingNumber(data.trackingNumber || '');
      setLabelUrl(data.labelUrl || '');
      setBarcode(data.barcode || '');

      onShipmentCreated?.(order.id, data.trackingNumber, data.labelUrl || '', data.barcode);

      message.success(`Kargo oluşturuldu. Takip No: ${data.trackingNumber || 'Oluşturulamadı'}`);
    } catch (err: unknown) {
      console.error(err);
      message.error('Kargo oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Render ------------------

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Select style={{ width: 150 }} placeholder="Kargo Firması" onChange={setCourier} value={courier || undefined} status={!courier ? 'error' : undefined}>
          <Option value="MNG">MNG</Option>
        </Select>

        <Select style={{ width: 150 }} placeholder="Şehir" value={selectedCity || undefined} onChange={handleCityChange} status={!selectedCity ? 'error' : undefined}>
          {cities.map((c: City) => <Option key={c.code} value={c.name}>{c.name}</Option>)}
        </Select>

        <Select style={{ width: 150 }} placeholder="İlçe" value={selectedDistrict || undefined} onChange={setSelectedDistrict} loading={loadingDistricts} disabled={!selectedCity} status={!selectedDistrict ? 'error' : undefined}>
          {districts.map((d: District) => <Option key={d.code} value={d.name}>{d.name}</Option>)}
        </Select>

        <Select style={{ width: 180 }} placeholder="Ödeme Türü" value={paymentType} onChange={setPaymentType}>
          <Option value={1}>Gönderici Ödemeli</Option>
          <Option value={2}>Alıcı Ödemeli</Option>
          <Option value={3}>Kapıda Ödeme</Option>
        </Select>

        <Button type="primary" onClick={handleCreateShipment} loading={loading}>Gönder</Button>
      </div>

      {(trackingNumber || barcode) && (
        <Paragraph>
          {trackingNumber && <><strong>Takip No:</strong> {trackingNumber} <br /></>}
          {labelUrl && <Link href={labelUrl} target="_blank">PDF Label</Link>}
          {barcode && <div><strong>Barkod:</strong> {barcode}</div>}
        </Paragraph>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Button, Select, message, Typography } from 'antd';
import { createMNGShipment, getCities, getDistrictsByCityCode } from '@/services/api';

const { Option } = Select;
const { Paragraph, Link } = Typography;

interface Order {
  id: string;
  name: string;
  total_price: string;
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
  onShipmentCreated?: (orderId: string, trackingNumber: string, labelUrl: string) => void;
}

// 🔹 Karakter normalize eder ve Türkçe büyük harfe çevirir
const normalizeCityName = (str: string = '') =>
  str
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('tr-TR');

// 🔹 Görsel isim formatı (İlk harf büyük, diğerleri küçük) — Türkçe uyumlu
const formatDisplayName = (name: string = '') =>
  name
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');

export default function MNGShipmentForm({ order, isReturn = false, onShipmentCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [labelUrl, setLabelUrl] = useState('');
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // 🔹 Şehirleri yükle
  useEffect(() => {
    fetchCities();
  }, []);

  // 🔹 Shopify adresinden city ve district match et
  useEffect(() => {
    if (cities.length === 0) return;
    const normalizedCustomerCity = normalizeCityName(order.customer.cityName);
    const foundCity = cities.find(c => normalizeCityName(c.name) === normalizedCustomerCity);
    if (foundCity) {
      setSelectedCity(foundCity.name);
      fetchDistricts(foundCity.code);
    }
  }, [cities]);

  // 🔹 İlçeyi eşleştir
  useEffect(() => {
    if (districts.length === 0 || !order.customer.districtName) return;
    const normalizedDistrict = normalizeCityName(order.customer.districtName);
    const foundDistrict = districts.find(d => normalizeCityName(d.name) === normalizedDistrict);
    if (foundDistrict) setSelectedDistrict(foundDistrict.name);
  }, [districts]);

  const fetchCities = async () => {
    try {
      const res = await getCities();
      const cityList = (res.data?.data || res.data || []).map((c: any) => ({
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
      const districtList = (res.data?.data || res.data || []).map((d: any) => ({
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

  const handleCreateShipment = async () => {
    if (!order.customer.name || order.customer.name.trim() === '') {
      return message.warning('Müşteri adı soyadı boş. Lütfen önce doldurun.');
    }
    if (!courier) return message.warning('Kargo firması seçin.');
    if (!selectedCity) return message.warning('Lütfen şehir seçin.');
    if (!selectedDistrict) return message.warning('Lütfen ilçe seçin.');

    setLoading(true);
    try {
      const city = cities.find(c => c.name === selectedCity);
      const district = districts.find(d => d.name === selectedDistrict);

      const orderData = {
        referenceId: order.id,
        content: `Sipariş: ${order.name}`,
        pieces: [{ barcode: `${order.id}_1`, desi: 2, kg: 1, content: 'Parça 1' }],
        recipient: {
          customerId: 0,
          refCustomerId: '',
          cityCode: city?.code || 0,
          districtCode: district?.code || 0,
          cityName: selectedCity,
          districtName: selectedDistrict,
          address: order.customer.address || '',
          email: order.customer.email || '',
          fullName: order.customer.name,
          mobilePhoneNumber: order.customer.phone || '',
        },
      };

      const res = await createMNGShipment({
        orderId: order.id,
        courier,
        isReturn,
        orderData,
      });

      setTrackingNumber(res.data.trackingNumber || '');
      setLabelUrl(res.data.labelUrl || '');
      onShipmentCreated?.(order.id, res.data.trackingNumber, res.data.labelUrl || '');

      message.success(`Kargo oluşturuldu. Takip No: ${res.data.trackingNumber}`);
    } catch (err: unknown) {
      console.error(err);
      message.error('Kargo oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Select
          style={{ width: 150 }}
          placeholder="Kargo Firması"
          onChange={setCourier}
          value={courier || undefined}
          status={!courier ? 'error' : undefined}
        >
          <Option value="MNG">MNG</Option>
        </Select>

        <Select
          style={{ width: 150 }}
          placeholder="Şehir"
          value={selectedCity || undefined}
          onChange={handleCityChange}
          status={!selectedCity ? 'error' : undefined}
        >
          {cities.map(c => (
            <Option key={c.code} value={c.name}>
              {c.name}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 150 }}
          placeholder="İlçe"
          value={selectedDistrict || undefined}
          onChange={setSelectedDistrict}
          loading={loadingDistricts}
          disabled={!selectedCity}
          status={!selectedDistrict ? 'error' : undefined}
        >
          {districts.map(d => (
            <Option key={d.code} value={d.name}>
              {d.name}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleCreateShipment} loading={loading}>
          Gönder
        </Button>
      </div>

      {trackingNumber && (
        <Paragraph>
          <strong>Takip No:</strong> {trackingNumber} <br />
          {labelUrl && (
            <Link href={labelUrl} target="_blank">
              PDF Label
            </Link>
          )}
        </Paragraph>
      )}
    </div>
  );
}

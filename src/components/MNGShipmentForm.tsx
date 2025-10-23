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

export default function MNGShipmentForm({ order, isReturn = false, onShipmentCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [selectedCity, setSelectedCity] = useState(order.customer.cityName || '');
  const [selectedDistrict, setSelectedDistrict] = useState(order.customer.districtName || '');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [labelUrl, setLabelUrl] = useState('');
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Sayfa açıldığında şehirleri al
  useEffect(() => {
    fetchCities();
  }, []);

  // Eğer seçili şehir varsa cityCode ile ilçeleri yükle
  useEffect(() => {
    if (selectedCity && cities.length > 0) {
      const city = cities.find(c => c.name === selectedCity);
      if (city) fetchDistricts(city.code);
    }
  }, [selectedCity, cities]);

  const fetchCities = async () => {
    try {
      const res = await getCities();
      setCities(res.data || []);
    } catch (err) {
      console.error('Şehirler alınamadı', err);
    }
  };

  const fetchDistricts = async (cityCode: string) => {
    setLoadingDistricts(true);
    try {
      const res = await getDistrictsByCityCode(cityCode);
      setDistricts(res.data || []);
    } catch (err) {
      console.error('İlçeler alınamadı', err);
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
    // 🔹 Müşteri adı soyad kontrolü
    if (!order.customer.name || order.customer.name.trim() === '') {
      return message.warning('Müşteri adı soyadı boş. Lütfen önce doldurun.');
    }
  
    if (!courier) return message.warning('Kargo firması seçin');
    if (!selectedCity || !selectedDistrict)
      return message.warning('Lütfen şehir ve ilçe bilgilerini seçin.');
  
    setLoading(true);
    try {
      const city = cities.find(c => c.name === selectedCity);
      const district = districts.find(d => d.name === selectedDistrict);
  
      const orderData = {
        referenceId: order.id,
        content: `Sipariş: ${order.name}`,
        pieces: [{ barcode: `${order.id}_1`, desi: 2, kg: 1, content: 'Parça 1' }],
        recipient: Number(process.env.NEXT_PUBLIC_MNG_CUSTOMER_ID)
          ? {
              customerId: Number(process.env.NEXT_PUBLIC_MNG_CUSTOMER_ID),
              refCustomerId: '',
              cityCode: 0,
              districtCode: 0,
              cityName: '',
              districtName: '',
              address: '',
              bussinessPhoneNumber: '',
              email: '',
              taxOffice: '',
              taxNumber: '',
              fullName: '',
              homePhoneNumber: '',
              mobilePhoneNumber: ''
            }
          : {
              customerId: 0,
              refCustomerId: '',
              cityCode: city?.code || 0,
              districtCode: district?.code || 0,
              cityName: selectedCity,
              districtName: selectedDistrict,
              address: order.customer.address || '',
              bussinessPhoneNumber: '',
              email: order.customer.email || '',
              taxOffice: '',
              taxNumber: '',
              fullName: order.customer.name, // artık boş olamaz
              homePhoneNumber: '',
              mobilePhoneNumber: order.customer.phone || ''
            }
      };
  
      const res = await createMNGShipment({
        orderId: order.id,
        courier,
        isReturn,
        orderData,
      });
  
      setTrackingNumber(res.data.trackingNumber || '');
      setLabelUrl(res.data.labelUrl || '');
  
      if (res.data.trackingNumber && onShipmentCreated) {
        onShipmentCreated(order.id, res.data.trackingNumber, res.data.labelUrl || '');
      }
  
      const typeText = isReturn ? 'İade kargo' : 'Kargo';
      message.success(`${typeText} oluşturuldu. Takip No: ${res.data.trackingNumber}`);
      if (res.data.trackingNumber) message.info('Shopify siparişi fulfillment ile güncellendi.');
  
    } catch (err: unknown) {
      if (err instanceof Error) message.error('Kargo oluşturulamadı: ' + err.message);
      else message.error('Kargo oluşturulamadı: Bilinmeyen hata');
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
        >
          <Option value="MNG">MNG</Option>
        </Select>

        <Select
          style={{ width: 150 }}
          placeholder="Şehir"
          value={selectedCity || undefined}
          onChange={handleCityChange}
        >
          {cities.map(c => (
            <Option key={c.code} value={c.name}>{c.name}</Option>
          ))}
        </Select>

        <Select
          style={{ width: 150 }}
          placeholder="İlçe"
          value={selectedDistrict || undefined}
          onChange={setSelectedDistrict}
          loading={loadingDistricts}
        >
          {districts.map(d => (
            <Option key={d.code} value={d.name}>{d.name}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleCreateShipment} loading={loading}>
          Gönder
        </Button>
      </div>

      {trackingNumber && (
        <Paragraph>
          <strong>Takip No:</strong> {trackingNumber} <br/>
          {labelUrl && <Link href={labelUrl} target="_blank">PDF Label</Link>}
        </Paragraph>
      )}
    </div>
  );
}

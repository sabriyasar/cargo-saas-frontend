import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Typography } from 'antd';
import { createIndividualMNGShipment, getCities, getDistrictsByCityCode } from '@/services/api';

const { Option } = Select;
const { Paragraph, Link } = Typography;

export default function IndividualShipment() {
  const [form] = Form.useForm();
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [labelUrl, setLabelUrl] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await getCities();
      setCities(res.data || []);
    } catch (err) {
      console.error(err);
      message.error('Şehirler alınamadı.');
    }
  };

  const fetchDistricts = async (cityCode: string) => {
    setLoadingDistricts(true);
    try {
      const res = await getDistrictsByCityCode(cityCode);
      setDistricts(res.data || []);
    } catch (err) {
      console.error(err);
      setDistricts([]);
      message.error('İlçeler alınamadı.');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleCityChange = (value: string) => {
    form.setFieldsValue({ districtName: undefined });
    const city = cities.find(c => c.name === value);
    if (city) fetchDistricts(city.code);
  };

  // 🟢 Yeni: BRYSL0001 gibi referenceId oluşturma
  const generateReferenceId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 basamaklı
    return `BRYSL${randomNum}`;
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const referenceId = generateReferenceId();

      const orderData = {
        referenceId,
        content: `Bireysel Gönderim: ${values.fullName}`,
        pieces: [
          { barcode: `${Date.now()}_1`, desi: 1, kg: 1, content: 'Parça 1' }
        ],
        recipient: {
          customerId: null,
          cityName: values.cityName,
          districtName: values.districtName,
          address: values.address,
          fullName: values.fullName,
          mobilePhoneNumber: values.mobilePhoneNumber,
          email: values.email || '',
        }
      };

      // createIndividualMNGShipment artık ShipmentResponse döndürüyor varsayımıyla:
      const res = await createIndividualMNGShipment(orderData, 'MNG');

      // Doğru kullanım: res.trackingNumber / res.labelUrl (res.data değil)
      setTrackingNumber(res.trackingNumber || '');
      setLabelUrl(res.labelUrl || '');

      // Formu temizle
      form.resetFields();

      message.success(`Bireysel gönderim oluşturuldu! Sipariş No: ${referenceId}`);
    } catch (err: any) {
      console.error(err);
      message.error('Kargo oluşturulamadı: ' + (err?.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Form.Item name="fullName" label="Alıcı Adı Soyadı" rules={[{ required: true }]}>
        <Input placeholder="Alıcı adı soyadı" />
      </Form.Item>

      <Form.Item name="mobilePhoneNumber" label="Telefon" rules={[{ required: true }]}>
        <Input placeholder="Telefon numarası" />
      </Form.Item>

      <Form.Item name="email" label="E-posta (opsiyonel)">
        <Input placeholder="E-posta" />
      </Form.Item>

      <Form.Item name="cityName" label="Şehir" rules={[{ required: true }]}>
        <Select placeholder="Şehir seçin" onChange={handleCityChange}>
          {cities.map(c => <Option key={c.code} value={c.name}>{c.name}</Option>)}
        </Select>
      </Form.Item>

      <Form.Item name="districtName" label="İlçe" rules={[{ required: true }]}>
        <Select placeholder="İlçe seçin" loading={loadingDistricts}>
          {districts.map(d => <Option key={d.code} value={d.name}>{d.name}</Option>)}
        </Select>
      </Form.Item>

      <Form.Item name="address" label="Adres" rules={[{ required: true }]}>
        <Input.TextArea placeholder="Adres" rows={3} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Kargo Oluştur
        </Button>
      </Form.Item>

      {trackingNumber && (
        <Paragraph>
          <strong>Takip No:</strong> {trackingNumber} <br/>
          {labelUrl && <Link href={labelUrl} target="_blank">PDF Label</Link>}
        </Paragraph>
      )}
    </Form>
  );
}

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Typography, Steps } from 'antd';
import { createIndividualMNGShipment, getCities, getDistrictsByCityCode } from '@/services/api';
import AdminLayout from '@/components/Layout';
import PackageStep from '@/components/PackageStep';
import ShippingStep from '@/components/ShippingStep';

const { Option } = Select;
const { Paragraph, Link } = Typography;
const { Step } = Steps;

export default function IndividualShipment() {
  const [form] = Form.useForm();
  const [cities, setCities] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [labelUrl, setLabelUrl] = useState('');

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem('shipmentCurrentStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });

  // ✅ ShippingStep için gerekli state’ler
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await getCities();
      setCities(res.data || []);
    } catch {
      message.error('Şehirler alınamadı.');
    }
  };

  const fetchDistricts = async (cityCode: string) => {
    setLoadingDistricts(true);
    try {
      const res = await getDistrictsByCityCode(cityCode);
      setDistricts(res.data || []);
    } catch {
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

  const generateReferenceId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `#BRYSL${randomNum}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const referenceId = generateReferenceId();

      const orderData = {
        referenceId,
        content: `Bireysel Gönderim: ${values.fullName}`,
        paymentType: values.paymentType,
        pieces: values.pieces || [
          { barcode: `${Date.now()}_1`, desi: 1, kg: 1, content: 'Parça 1' },
        ],
        recipient: {
          customerId: null,
          cityName: values.cityName,
          districtName: values.districtName,
          address: values.address,
          fullName: values.fullName,
          mobilePhoneNumber: '+90' + (values.mobilePhoneNumber || '').replace(/\D/g, ''),
          email: values.email || '',
        },
      };

      const res = await createIndividualMNGShipment(orderData, 'MNG');

      setTrackingNumber(res.trackingNumber || '');
      setLabelUrl(res.labelUrl || '');

      message.success(`Bireysel gönderim oluşturuldu! Sipariş No: ${referenceId}`);
      localStorage.removeItem('shipmentCurrentStep');
    } catch (err: any) {
      message.error('Kargo oluşturulamadı: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => {
      const next = prev + 1;
      localStorage.setItem('shipmentCurrentStep', next.toString());
      return next;
    });
  };

  const prevStep = () => {
    setCurrentStep(prev => {
      const newStep = prev - 1;
      localStorage.setItem('shipmentCurrentStep', newStep.toString());
      return newStep;
    });
  };

  // ✅ Güvenli filter fonksiyonu
  const filterOption = (input: string, option?: any) => {
    if (!option?.children) return false;
    return (option.children as string).toLowerCase().includes(input.toLowerCase());
  };

  return (
    <AdminLayout>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Adres Bilgileri" />
        <Step title="Kargo Paket Bilgileri" />
        <Step title="Gönderim Ücretleri" />
        <Step title="Ödeme Onay" />
      </Steps>

      <Form form={form} layout="vertical">
        {currentStep === 0 && (
          <>
            <Form.Item
              name="senderLocation"
              label="Gönderici Konum Adı"
              rules={[{ required: true, message: 'Gönderici konumu gerekli' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Gönderici konumunu seçin veya arayın"
                filterOption={filterOption}
              >
                <Option value="Ankara Merkez">Ankara Merkez</Option>
                <Option value="İstanbul Şube">İstanbul Şube</Option>
                <Option value="İzmir Depo">İzmir Depo</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Alıcı Adı Soyadı"
              rules={[{ required: true, message: 'Alıcı adı soyadı gerekli' }]}
            >
              <Input placeholder="Alıcı adı soyadı" />
            </Form.Item>

            <Form.Item
              name="mobilePhoneNumber"
              label="Telefon"
              rules={[
                { required: true, message: 'Telefon numarası gerekli' },
                {
                  validator: (_, value) =>
                    value && value.replace(/\D/g, '').length === 10
                      ? Promise.resolve()
                      : Promise.reject(new Error('Telefon numarası 10 haneli olmalı')),
                },
              ]}
            >
              <Input
                addonBefore="+90"
                placeholder="5XX XXX XX XX"
                maxLength={14}
                onChange={e => {
                  let raw = e.target.value.replace(/\D/g, '');
                  if (raw.length > 10) raw = raw.slice(0, 10);
                  let formatted = '';
                  if (raw.length > 0) formatted += raw.slice(0, 3);
                  if (raw.length > 3) formatted += ' ' + raw.slice(3, 6);
                  if (raw.length > 6) formatted += ' ' + raw.slice(6, 8);
                  if (raw.length > 8) formatted += ' ' + raw.slice(8, 10);
                  form.setFieldsValue({ mobilePhoneNumber: formatted });
                }}
              />
            </Form.Item>

            {/* Şehir Select */}
            <Form.Item
              name="cityName"
              label="Şehir"
              rules={[{ required: true, message: 'Şehir seçin' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="Şehir seçin"
                onChange={handleCityChange}
                filterOption={filterOption}
              >
                {cities.map(c => (
                  <Option key={c.code} value={c.name}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* İlçe Select */}
            <Form.Item
              name="districtName"
              label="İlçe"
              rules={[{ required: true, message: 'İlçe seçin' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder="İlçe seçin"
                loading={loadingDistricts}
                filterOption={filterOption}
              >
                {districts.map(d => (
                  <Option key={d.code} value={d.name}>
                    {d.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="address"
              label="Adres"
              rules={[{ required: true, message: 'Adres gerekli' }]}
            >
              <Input.TextArea placeholder="Adres" rows={3} />
            </Form.Item>
          </>
        )}

        {currentStep === 1 && <PackageStep />}

        {currentStep === 2 && (
  <ShippingStep
    selectedPlan={selectedPlan}
    setSelectedPlan={setSelectedPlan}
    selectedShipping={selectedShipping}
    setSelectedShipping={setSelectedShipping}
  />
)}

        {currentStep === 3 && (
          <Paragraph>
            Ödeme onay sayfası burada olacak <br />
            {trackingNumber && (
              <>
                <strong>Takip No:</strong> {trackingNumber} <br />
                {labelUrl && (
                  <Link href={labelUrl} target="_blank">
                    PDF Label
                  </Link>
                )}
              </>
            )}
          </Paragraph>
        )}

        <div style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prevStep}>
              Geri
            </Button>
          )}
          {currentStep < 3 && (
            <Button type="primary" onClick={nextStep}>
              İleri
            </Button>
          )}
          {currentStep === 3 && (
            <Button type="primary" loading={loading} onClick={handleSubmit}>
              Kargo Oluştur
            </Button>
          )}
        </div>
      </Form>
    </AdminLayout>
  );
}

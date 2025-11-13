import React, { useState } from 'react';
import { Form, Input, Button, Select, Modal, message, Typography, InputNumber } from 'antd';

const { Option } = Select;

interface BoxType {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight?: number;
  content?: string;
  value?: number;
}

export default function PackageStep() {
  const [form] = Form.useForm();
  const [boxes, setBoxes] = useState<BoxType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newBoxForm] = Form.useForm();
  const [canAdd, setCanAdd] = useState(false);

  const handleAddBox = () => {
    newBoxForm.validateFields().then(values => {
      const newBox: BoxType = {
        id: Date.now().toString(),
        name: values.name,
        length: values.length,
        width: values.width,
        height: values.height,
      };
      setBoxes(prev => [...prev, newBox]);
      setShowModal(false);
      newBoxForm.resetFields();
      setCanAdd(false);
      message.success('Yeni kutu eklendi!');
    });
  };

  return (
    <div>
      <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
        {/* Kutu Seçin */}
        <Form.Item
          name="selectedBox"
          label="Kutu Seçin"
          rules={[{ required: true, message: 'Lütfen bir kutu seçin veya yeni kutu ekleyin!' }]}
          style={{ marginBottom: 16 }}
        >
          <Select
            placeholder="Kutu seçin"
            dropdownRender={menu => (
              <>
                {menu}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 8,
                    cursor: 'pointer',
                    color: '#1890ff',
                    fontWeight: 500,
                  }}
                  onClick={() => setShowModal(true)}
                >
                  <Typography.Text>+ Yeni Kutu Ekle</Typography.Text>
                </div>
              </>
            )}
          >
            {boxes.map(box => (
              <Option key={box.id} value={box.id}>
                {box.name} ({box.length}x{box.width}x{box.height} cm)
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Typography.Title level={5}>Kutu Bilgilerini Girin</Typography.Title>

        {/* Kutu Boyutları */}
        <Form.Item label="Kutu Boyutları (cm)" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Form.Item
              name="length"
              noStyle
              rules={[{ required: true, message: 'Uzunluk gerekli' }]}
            >
              <InputNumber min={1} placeholder="Uzunluk" style={{ width: 100 }} />
            </Form.Item>
            <span>x</span>
            <Form.Item
              name="width"
              noStyle
              rules={[{ required: true, message: 'Genişlik gerekli' }]}
            >
              <InputNumber min={1} placeholder="Genişlik" style={{ width: 100 }} />
            </Form.Item>
            <span>x</span>
            <Form.Item
              name="height"
              noStyle
              rules={[{ required: true, message: 'Yükseklik gerekli' }]}
            >
              <InputNumber min={1} placeholder="Yükseklik" style={{ width: 100 }} />
            </Form.Item>
          </div>
        </Form.Item>

        {/* Ağırlık */}
        <Form.Item
          label="Ağırlık (kg)"
          name="weight"
          rules={[{ required: true, message: 'Ağırlık gerekli' }]}
          help="Kargo ücretinizin sonradan artmaması için doğru ağırlık giriniz."
          style={{ marginBottom: 16 }}
        >
          <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="Ağırlık" />
        </Form.Item>

        {/* Paket İçeriği */}
        <Form.Item
          label="Paket İçeriği"
          name="content"
          rules={[{ required: true, message: 'Paket içeriği gerekli' }]}
          style={{ marginBottom: 16 }}
        >
          <Input placeholder="Paket içeriğini girin" />
        </Form.Item>

        {/* Paket Değeri */}
        <Form.Item
          label="Paket Değeri (TL)"
          name="value"
          rules={[{ required: true, message: 'Paket değeri gerekli' }]}
          style={{ marginBottom: 16 }}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Paket değeri" />
        </Form.Item>
      </Form>

      {/* Modal: Yeni Kutu Ekle */}
      <Modal
        title="Yeni Kutu Ekle"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowModal(false)}>İptal</Button>,
          <Button key="add" type="primary" disabled={!canAdd} onClick={handleAddBox}>
            Ekle
          </Button>,
        ]}
      >
        <Form
          form={newBoxForm}
          layout="vertical"
          style={{ maxWidth: 400 }}
          onValuesChange={() => {
            const values = newBoxForm.getFieldsValue();
            setCanAdd(values.name && values.length && values.width && values.height ? true : false);
          }}
        >
          <Form.Item
            name="name"
            label={<span>Kutu Adı <span style={{ color: 'red' }}>*</span></span>}
            rules={[{ required: true, message: 'Kutu adı gerekli' }]}
            style={{ marginBottom: 16 }}
          >
            <Input placeholder="Örn: Küçük Kutu" />
          </Form.Item>

          <Form.Item
            name="length"
            label={<span>Uzunluk (cm) <span style={{ color: 'red' }}>*</span></span>}
            rules={[
              { required: true, message: 'Uzunluk gerekli' },
              {
                validator: (_, value) =>
                  value > 9999
                    ? Promise.reject(new Error('Uzunluk en fazla 9999 cm olabilir'))
                    : Promise.resolve(),
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Uzunluk" />
          </Form.Item>

          <Form.Item
            name="width"
            label={<span>Genişlik (cm) <span style={{ color: 'red' }}>*</span></span>}
            rules={[
              { required: true, message: 'Genişlik gerekli' },
              {
                validator: (_, value) =>
                  value > 9999
                    ? Promise.reject(new Error('Genişlik en fazla 9999 cm olabilir'))
                    : Promise.resolve(),
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Genişlik" />
          </Form.Item>

          <Form.Item
            name="height"
            label={<span>Yükseklik (cm) <span style={{ color: 'red' }}>*</span></span>}
            rules={[
              { required: true, message: 'Yükseklik gerekli' },
              {
                validator: (_, value) =>
                  value > 9999
                    ? Promise.reject(new Error('Yükseklik en fazla 9999 cm olabilir'))
                    : Promise.resolve(),
              },
            ]}
            style={{ marginBottom: 16 }}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Yükseklik" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

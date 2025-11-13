import React, { useState } from 'react';
import { Modal, Button, InputNumber, Input, Space, Divider } from 'antd';
import { WalletOutlined } from '@ant-design/icons';

export default function CreditLoadModal() {
  const [visible, setVisible] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');

  const predefinedAmounts = [100, 500, 1000, 2000, 4000];

  const handlePredefinedClick = (value: number) => setAmount(value);

  const subtotal = amount;
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const handleApplyPromo = () => {
    if (promoCode === 'DISCOUNT50') {
      alert('Promo kod %50 indirim uygulandı!');
    } else {
      alert('Geçersiz promosyon kodu.');
    }
  };

  return (
    <>
      <Button
        type="default"
        className="credit-load-btn"
        icon={<WalletOutlined />}
        onClick={() => setVisible(true)}
      >
        <span className="btn-text">Bakiye Yükle</span>
      </Button>

      <Modal
        className="credit-load-modal"
        title="Kredi Yükleme"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{ padding: 32 }}
      >
        <div className="credit-modal-content">
          {/* Sol alan: Kredi yükleme */}
          <div className="credit-load-left">
            <h3>Kredi Yükle</h3>
            <InputNumber
              className="credit-input"
              min={0}
              value={amount}
              onChange={(val) => setAmount(val || 0)}
              placeholder="Miktar girin"
            />
            <Space className="predefined-buttons">
              {predefinedAmounts.map((val, idx) => (
                <Button
                  key={idx}
                  size="large"
                  className="predefined-btn"
                  onClick={() => handlePredefinedClick(val)}
                >
                  {val}₺
                </Button>
              ))}
            </Space>
            <Button type="primary" className="credit-submit-btn">
              Kredi Yükle
            </Button>
          </div>

          <Divider type="vertical" />

          {/* Sağ alan: Sepet özeti */}
          <div className="credit-load-right">
            <h3>Sepet Özeti</h3>
            <div className="summary-item">
              <span>Ara Toplam:</span> <span>{subtotal}₺</span>
            </div>
            <div className="summary-item">
              <span>KDV (%20):</span> <span>{tax.toFixed(2)}₺</span>
            </div>
            <div className="promo-code">
              <Input
                placeholder="Promosyon Kodu"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button onClick={handleApplyPromo} className="promo-btn">
                Uygula
              </Button>
            </div>
            <Divider />
            <div className="total-amount">
              <span>Toplam:</span> <span>{total.toFixed(2)}₺</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

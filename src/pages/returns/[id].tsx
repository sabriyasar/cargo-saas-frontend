import React from 'react';
import { useRouter } from 'next/router';

export default function ReturnDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>İade Detayı: {id}</h1>
      {/* Burada iade detay componentlerini render edebilirsin */}
    </div>
  );
}

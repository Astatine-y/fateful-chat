'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EyePortal } from '@/components/EyePortal';
import { ResultReveal } from '@/components/ResultReveal';

interface BaziData {
  year: string;
  month: string;
  day: string;
  hour: string;
}

interface BaziResult {
  bazi: BaziData;
  interpretation: string;
  creditsRemaining: number;
}

function BaziPageContent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BaziResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (data: {
    year: string;
    month: string;
    day: string;
    hour: string;
    gender: 'male' | 'female';
  }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use default location (Beijing) for now - can be enhanced with location picker
      const response = await fetch('/api/bazi', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          year: parseInt(data.year, 10),
          month: parseInt(data.month, 10),
          day: parseInt(data.day, 10),
          hour: parseInt(data.hour, 10),
          gender: data.gender,
          longitude: 120,
          latitude: 30,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Free limit reached
          setLoading(false);
          return;
        }
        throw new Error(responseData.error || 'Failed to calculate');
      }

      // Store result if logged in
      if (responseData.data?.creditsRemaining !== undefined) {
        setResult(responseData.data);
      }
      
      // Show result modal
      setShowResult(true);
    } catch (err) {
      console.error('Bazi calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
  };

  return (
    <>
      <EyePortal onSubmit={handleSubmit} loading={loading} />
      
      {showResult && result && (
        <ResultReveal 
          result={result} 
          onClose={closeResult}
        />
      )}
    </>
  );
}

export default function BaziPage() {
  return <BaziPageContent />;
}
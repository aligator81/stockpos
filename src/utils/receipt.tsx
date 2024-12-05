import { Sale } from '../types';
import { pdf } from '@react-pdf/renderer';
import ReceiptPDF from '../components/ReceiptPDF';
import React from 'react';

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
}

export const printReceipt = async (sale: Sale, storeInfo: StoreInfo): Promise<boolean> => {
  try {
    // Generate PDF blob
    const blob = await pdf(
      <ReceiptPDF
        sale={sale}
        storeInfo={storeInfo}
      />
    ).toBlob();

    // Create URL for the blob
    const url = URL.createObjectURL(blob);

    // Open PDF in new tab
    window.open(url, '_blank');

    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 100);

    return true;
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw new Error('Failed to generate receipt');
  }
};
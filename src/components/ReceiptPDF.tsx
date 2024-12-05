import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Sale } from '../types';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoSection: {
    width: '40%',
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  storeInfoSection: {
    width: '55%',
    alignItems: 'flex-end',
  },
  storeName: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  storeInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#666',
  },
  headerNote: {
    marginTop: 8,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  receiptInfo: {
    marginBottom: 20,
  },
  items: {
    marginTop: 10,
    marginBottom: 10,
    borderTop: '1 solid black',
    borderBottom: '1 solid black',
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottom: '1 dotted black',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  itemQty: {
    width: '15%',
  },
  itemName: {
    width: '50%',
  },
  itemPrice: {
    width: '15%',
    textAlign: 'right',
  },
  itemTotal: {
    width: '20%',
    textAlign: 'right',
  },
  totals: {
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#666',
  },
  contactInfo: {
    fontSize: 8,
    color: '#666',
    marginTop: 4,
  },
});

interface ReceiptPDFProps {
  sale: Sale;
}

export default function ReceiptPDF({ sale }: ReceiptPDFProps) {
  // Get receipt settings from localStorage
  const settings = JSON.parse(localStorage.getItem('receiptSettings') || '{}');
  
  // Get all product names from localStorage
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const getProductName = (productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  return (
    <Document>
      <Page size="A6" style={styles.page}>
        {/* Header with two columns */}
        <View style={styles.header}>
          {/* Left column - Logo */}
          <View style={styles.logoSection}>
            {settings.logo && settings.showLogo && (
              <Image src={settings.logo} style={styles.logo} />
            )}
          </View>

          {/* Right column - Store Info */}
          <View style={styles.storeInfoSection}>
            <Text style={styles.storeName}>{settings.storeName || 'AtoZ Store'}</Text>
            {settings.address && (
              <Text style={styles.storeInfo}>{settings.address}</Text>
            )}
            {settings.phone && (
              <Text style={styles.storeInfo}>Tel: {settings.phone}</Text>
            )}
            {settings.email && (
              <Text style={styles.storeInfo}>{settings.email}</Text>
            )}
            {settings.website && (
              <Text style={styles.storeInfo}>{settings.website}</Text>
            )}
          </View>
        </View>

        {/* Header Note */}
        {settings.headerNote && (
          <Text style={styles.headerNote}>{settings.headerNote}</Text>
        )}

        {/* Receipt Info */}
        <View style={styles.receiptInfo}>
          <Text>Receipt #: {sale.id}</Text>
          <Text>Date: {format(sale.timestamp, 'dd/MM/yyyy HH:mm')}</Text>
          <Text>Payment: {sale.paymentMethod === 'cash' ? 'Cash' : 'E-Transfer'}</Text>
        </View>

        {/* Items */}
        <View style={styles.items}>
          {/* Items Header */}
          <View style={styles.itemHeader}>
            <Text style={styles.itemQty}>Qty</Text>
            <Text style={styles.itemName}>Item</Text>
            <Text style={styles.itemPrice}>Price</Text>
            <Text style={styles.itemTotal}>Total</Text>
          </View>

          {/* Items List */}
          {sale.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemQty}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{getProductName(item.productId)}</Text>
              <Text style={styles.itemPrice}>${item.priceAtSale.toFixed(2)}</Text>
              <Text style={styles.itemTotal}>
                ${(item.quantity * item.priceAtSale).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Total:</Text>
            <Text style={styles.bold}>${sale.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {settings.footerNote && (
            <Text style={styles.footerNote}>{settings.footerNote}</Text>
          )}
          <Text style={styles.contactInfo}>
            {settings.phone && `Tel: ${settings.phone}`}
            {settings.email && ` | Email: ${settings.email}`}
          </Text>
          {settings.website && (
            <Text style={styles.contactInfo}>{settings.website}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
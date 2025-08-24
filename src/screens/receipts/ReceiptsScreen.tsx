import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, Chip, useTheme, Surface, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReceiptsStackParamList } from '@types/index';

type ReceiptsScreenNavigationProp = NativeStackNavigationProp<ReceiptsStackParamList, 'ReceiptsList'>;

const ReceiptsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<ReceiptsScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Sample receipt data
  const receipts = [
    { 
      id: 1, 
      date: '2025-08-23', 
      category: 'Fuel', 
      amount: 85.50, 
      merchant: 'Shell Station Jurong', 
      imageUrl: null,
      ocrStatus: 'processed',
      expenseLinked: true
    },
    { 
      id: 2, 
      date: '2025-08-22', 
      category: 'Maintenance', 
      amount: 150.00, 
      merchant: 'AutoCare Service Centre', 
      imageUrl: null,
      ocrStatus: 'processed',
      expenseLinked: true
    },
    { 
      id: 3, 
      date: '2025-08-21', 
      category: 'Food', 
      amount: 25.80, 
      merchant: 'Coffee Bean & Tea Leaf', 
      imageUrl: null,
      ocrStatus: 'processing',
      expenseLinked: false
    },
    { 
      id: 4, 
      date: '2025-08-20', 
      category: 'Fuel', 
      amount: 78.90, 
      merchant: 'Esso Station', 
      imageUrl: null,
      ocrStatus: 'failed',
      expenseLinked: false
    },
  ];

  const categories = ['All', 'Fuel', 'Maintenance', 'Food', 'Parking', 'Insurance'];
  
  const filteredReceipts = selectedFilter === 'All' 
    ? receipts 
    : receipts.filter(receipt => receipt.category === selectedFilter);

  const getOcrStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return theme.colors.primary;
      case 'processing': return theme.colors.tertiary;
      case 'failed': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const getOcrStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return 'check-circle';
      case 'processing': return 'loading';
      case 'failed': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    statsCard: {
      margin: 16,
      padding: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
      marginTop: 4,
    },
    filterContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    receiptCard: {
      margin: 8,
      marginHorizontal: 16,
      overflow: 'hidden',
    },
    receiptContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    receiptImage: {
      width: 60,
      height: 60,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptDetails: {
      flex: 1,
    },
    receiptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    receiptAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    receiptMerchant: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500',
      marginBottom: 2,
    },
    receiptCategory: {
      fontSize: 14,
      color: theme.colors.primary,
    },
    receiptDate: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    receiptStatus: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginBottom: 4,
    },
    statusText: {
      fontSize: 10,
      marginLeft: 4,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    linkedBadge: {
      fontSize: 10,
      color: theme.colors.primary,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.colors.onSurface,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  const totalReceipts = receipts.length;
  const processedReceipts = receipts.filter(r => r.ocrStatus === 'processed').length;
  const linkedReceipts = receipts.filter(r => r.expenseLinked).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Receipt Manager</Text>
        <Text style={styles.subtitle}>Capture and organize your receipts</Text>
      </View>

      {/* Statistics Card */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalReceipts}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{processedReceipts}</Text>
            <Text style={styles.statLabel}>Processed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{linkedReceipts}</Text>
            <Text style={styles.statLabel}>Linked</Text>
          </View>
        </View>
      </Card>

      {/* Category Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <Chip
                key={category}
                selected={selectedFilter === category}
                onPress={() => setSelectedFilter(category)}
                style={{ marginRight: 8 }}
              >
                {category}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Receipts List */}
      <ScrollView style={{ flex: 1 }}>
        {filteredReceipts.length > 0 ? (
          filteredReceipts.map((receipt) => (
            <Card key={receipt.id} style={styles.receiptCard}>
              <TouchableOpacity>
                <View style={styles.receiptContent}>
                  {/* Receipt Thumbnail */}
                  <Surface style={styles.receiptImage}>
                    <MaterialCommunityIcons 
                      name="receipt" 
                      size={24} 
                      color={theme.colors.onSurfaceVariant} 
                    />
                  </Surface>

                  {/* Receipt Details */}
                  <View style={styles.receiptDetails}>
                    <View style={styles.receiptHeader}>
                      <Text style={styles.receiptMerchant}>{receipt.merchant}</Text>
                      <Text style={styles.receiptAmount}>S${receipt.amount.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.receiptCategory}>{receipt.category}</Text>
                    <Text style={styles.receiptDate}>{receipt.date}</Text>
                  </View>

                  {/* Status Indicators */}
                  <View style={styles.receiptStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: getOcrStatusColor(receipt.ocrStatus) + '20' }]}>
                      <MaterialCommunityIcons 
                        name={getOcrStatusIcon(receipt.ocrStatus)}
                        size={12}
                        color={getOcrStatusColor(receipt.ocrStatus)}
                      />
                      <Text style={[styles.statusText, { color: getOcrStatusColor(receipt.ocrStatus) }]}>
                        {receipt.ocrStatus}
                      </Text>
                    </View>
                    {receipt.expenseLinked && (
                      <Text style={styles.linkedBadge}>📎 Linked</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="receipt-outline" 
              size={64} 
              color={theme.colors.outline}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No receipts found</Text>
            <Text style={styles.emptyDescription}>
              Tap the camera button below to start capturing your receipts for automatic processing
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Capture Receipt FAB */}
      <FAB
        style={styles.fab}
        icon="camera"
        label="Capture"
        onPress={() => {
          navigation.navigate('ReceiptCapture', {});
        }}
      />
    </View>
  );
};

export default ReceiptsScreen;
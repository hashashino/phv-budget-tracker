import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme, 
  SegmentedButtons, 
  Surface,
  IconButton,
  Divider 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReportsScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Sample report data
  const reportData = {
    monthly: {
      totalEarnings: 5200.00,
      totalExpenses: 1450.25,
      netIncome: 3749.75,
      averageDaily: 121.61,
      totalTrips: 156,
      workingDays: 22,
      fuelCost: 680.50,
      maintenanceCost: 320.75,
      gstCollected: 416.00,
      gstPaid: 116.02,
    },
    quarterly: {
      totalEarnings: 15600.00,
      totalExpenses: 4350.75,
      netIncome: 11249.25,
      averageDaily: 121.61,
      totalTrips: 468,
      workingDays: 66,
      fuelCost: 2041.50,
      maintenanceCost: 962.25,
      gstCollected: 1248.00,
      gstPaid: 348.06,
    },
  };

  const currentData = reportData[selectedPeriod as keyof typeof reportData];

  const exportOptions = [
    { icon: 'file-pdf-box', label: 'Export PDF', color: theme.colors.error },
    { icon: 'file-excel-box', label: 'Export Excel', color: theme.colors.tertiary },
    { icon: 'email', label: 'Email Report', color: theme.colors.primary },
    { icon: 'cloud-upload', label: 'Upload to Cloud', color: theme.colors.secondary },
  ];

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
    periodSelector: {
      margin: 16,
    },
    summaryCard: {
      margin: 16,
      padding: 20,
      backgroundColor: theme.colors.primaryContainer,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onPrimaryContainer,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.onPrimaryContainer,
      opacity: 0.8,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimaryContainer,
    },
    netIncomeValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onPrimaryContainer,
    },
    metricsCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
    },
    metricsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
    },
    taxCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
    },
    taxTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    taxRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    taxLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    taxValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    exportCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
    },
    exportTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    exportGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    exportOption: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surfaceVariant,
    },
    exportIcon: {
      marginBottom: 8,
    },
    exportLabel: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Financial Reports</Text>
        <Text style={styles.subtitle}>Analyze your PHV business performance</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              { value: 'monthly', label: 'This Month' },
              { value: 'quarterly', label: 'This Quarter' },
            ]}
          />
        </View>

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {selectedPeriod === 'monthly' ? 'Monthly' : 'Quarterly'} Summary
          </Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Earnings</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              +S${currentData.totalEarnings.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
              -S${currentData.totalExpenses.toFixed(2)}
            </Text>
          </View>
          
          <Divider style={{ marginVertical: 8 }} />
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: '600' }]}>Net Income</Text>
            <Text style={styles.netIncomeValue}>
              S${currentData.netIncome.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Key Metrics */}
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{currentData.totalTrips}</Text>
              <Text style={styles.metricLabel}>Total Trips</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{currentData.workingDays}</Text>
              <Text style={styles.metricLabel}>Working Days</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>S${currentData.averageDaily.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Avg Daily Income</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{(currentData.totalTrips / currentData.workingDays).toFixed(1)}</Text>
              <Text style={styles.metricLabel}>Trips per Day</Text>
            </View>
          </View>
        </Card>

        {/* Expense Breakdown */}
        <Card style={styles.metricsCard}>
          <Text style={styles.metricsTitle}>Top Expense Categories</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>S${currentData.fuelCost.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Fuel Costs</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>S${currentData.maintenanceCost.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Maintenance</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {((currentData.fuelCost / currentData.totalExpenses) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Fuel % of Expenses</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {((currentData.totalExpenses / currentData.totalEarnings) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Expense Ratio</Text>
            </View>
          </View>
        </Card>

        {/* GST Summary */}
        <Card style={styles.taxCard}>
          <Text style={styles.taxTitle}>GST Summary</Text>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>GST Collected (on earnings)</Text>
            <Text style={styles.taxValue}>S${currentData.gstCollected.toFixed(2)}</Text>
          </View>
          <View style={styles.taxRow}>
            <Text style={styles.taxLabel}>GST Paid (on expenses)</Text>
            <Text style={styles.taxValue}>S${currentData.gstPaid.toFixed(2)}</Text>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <View style={styles.taxRow}>
            <Text style={[styles.taxLabel, { fontWeight: '600' }]}>Net GST Payable</Text>
            <Text style={[styles.taxValue, { fontWeight: 'bold', color: theme.colors.primary }]}>
              S${(currentData.gstCollected - currentData.gstPaid).toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Export Options */}
        <Card style={styles.exportCard}>
          <Text style={styles.exportTitle}>Export & Share</Text>
          <View style={styles.exportGrid}>
            {exportOptions.map((option, index) => (
              <Surface key={index} style={styles.exportOption} elevation={0}>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={24}
                  color={option.color}
                  style={styles.exportIcon}
                />
                <Text style={styles.exportLabel}>{option.label}</Text>
              </Surface>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

export default ReportsScreen;
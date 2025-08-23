import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Chip, useTheme, SegmentedButtons } from 'react-native-paper';

const EarningsScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Sample PHV earnings data
  const earnings = [
    { id: 1, date: '2025-08-23', time: '14:30', platform: 'Grab', amount: 45.80, tripType: 'GrabCar', distance: '12.3km', duration: '28min' },
    { id: 2, date: '2025-08-23', time: '12:15', platform: 'TADA', amount: 32.50, tripType: 'Standard', distance: '8.7km', duration: '19min' },
    { id: 3, date: '2025-08-23', time: '09:45', platform: 'Grab', amount: 28.90, tripType: 'GrabCar', distance: '6.2km', duration: '15min' },
    { id: 4, date: '2025-08-22', time: '18:20', platform: 'Gojek', amount: 41.20, tripType: 'GoRide', distance: '11.5km', duration: '24min' },
    { id: 5, date: '2025-08-22', time: '16:00', platform: 'Grab', amount: 52.30, tripType: 'GrabCar Premium', distance: '15.8km', duration: '32min' },
  ];

  const platforms = ['All', 'Grab', 'TADA', 'Gojek', 'ComfortDelGro'];
  
  const filteredEarnings = selectedPlatform === 'All' 
    ? earnings 
    : earnings.filter(earning => earning.platform === selectedPlatform);

  const periodEarnings = selectedPeriod === 'today' 
    ? filteredEarnings.filter(earning => earning.date === '2025-08-23')
    : filteredEarnings;

  const totalEarnings = periodEarnings.reduce((sum, earning) => sum + earning.amount, 0);

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
    totalCard: {
      margin: 16,
      padding: 16,
      backgroundColor: theme.colors.primaryContainer,
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onPrimaryContainer,
    },
    periodSelector: {
      marginHorizontal: 16,
      marginBottom: 8,
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
    earningCard: {
      margin: 8,
      marginHorizontal: 16,
    },
    earningHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    earningAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    platformBadge: {
      fontSize: 14,
      color: theme.colors.onSecondaryContainer,
      backgroundColor: theme.colors.secondaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      fontWeight: '500',
    },
    tripDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    tripType: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    tripTime: {
      fontSize: 14,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    tripStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    tripStat: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PHV Earnings</Text>
        <Text style={styles.subtitle}>Track income from ride-hailing platforms</Text>
      </View>

      {/* Total Earnings Card */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalAmount}>+S${totalEarnings.toFixed(2)}</Text>
        <Text>
          {selectedPeriod === 'today' ? "Today's" : "Total"} {selectedPlatform !== 'All' ? selectedPlatform : ''} Earnings
        </Text>
      </Card>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <SegmentedButtons
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          buttons={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ]}
        />
      </View>

      {/* Platform Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipContainer}>
            {platforms.map((platform) => (
              <Chip
                key={platform}
                selected={selectedPlatform === platform}
                onPress={() => setSelectedPlatform(platform)}
                style={{ marginRight: 8 }}
              >
                {platform}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Earnings List */}
      <ScrollView style={{ flex: 1 }}>
        {periodEarnings.map((earning) => (
          <Card key={earning.id} style={styles.earningCard}>
            <Card.Content>
              <View style={styles.earningHeader}>
                <Text style={styles.platformBadge}>{earning.platform}</Text>
                <Text style={styles.earningAmount}>+S${earning.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.tripDetails}>
                <Text style={styles.tripType}>{earning.tripType}</Text>
                <Text style={styles.tripTime}>{earning.time}</Text>
              </View>
              <View style={styles.tripStats}>
                <Text style={styles.tripStat}>{earning.distance}</Text>
                <Text style={styles.tripStat}>{earning.duration}</Text>
                <Text style={styles.tripStat}>{earning.date}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add Earning FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Earning"
        onPress={() => {
          console.log('Add earning pressed');
        }}
      />
    </View>
  );
};

export default EarningsScreen;
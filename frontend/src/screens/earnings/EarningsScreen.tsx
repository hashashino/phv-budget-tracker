import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, FAB, Chip, useTheme, SegmentedButtons, IconButton, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EarningsStackParamList } from '@types/index';
import { earningService, Earning } from '@/services/api/earningService';

type EarningsScreenNavigationProp = NativeStackNavigationProp<EarningsStackParamList, 'EarningsList'>;

const EarningsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<EarningsScreenNavigationProp>();
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load earnings from API
  const loadEarnings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await earningService.getEarnings({ limit: 100 });
      if (response.success && response.data?.earnings) {
        setEarnings(response.data.earnings);
      } else {
        setEarnings([]);
      }
    } catch (err) {
      console.error('Failed to load earnings:', err);
      setError('Failed to load earnings');
      setEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  // Load earnings when component mounts
  useEffect(() => {
    loadEarnings();
  }, []);

  const handleDeleteEarning = async (earningId: string) => {
    Alert.alert(
      'Delete Earning',
      'Are you sure you want to delete this earning record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await earningService.deleteEarning(earningId);
              setEarnings(prev => prev.filter(earning => earning.id !== earningId));
            } catch (err) {
              console.error('Failed to delete earning:', err);
              Alert.alert('Error', 'Failed to delete earning. Please try again.');
            }
          }
        }
      ]
    );
  };

  const platforms = ['All', 'Grab', 'TADA', 'Gojek', 'ComfortDelGro'];
  
  const filteredEarnings = selectedPlatform === 'All' 
    ? earnings 
    : earnings.filter(earning => earning.platform?.name === selectedPlatform);

  const today = new Date().toISOString().split('T')[0];
  const periodEarnings = selectedPeriod === 'today' 
    ? filteredEarnings.filter(earning => earning.date.startsWith(today))
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
      color: theme.colors.onPrimaryContainer,
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      fontWeight: '600',
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
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    deleteButton: {
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 20,
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
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading earnings...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
            <Button mode="contained" onPress={loadEarnings}>Retry</Button>
          </View>
        ) : periodEarnings.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.onSurface, textAlign: 'center' }}>No earnings found</Text>
          </View>
        ) : (
          periodEarnings.map((earning) => (
            <Card key={earning.id} style={styles.earningCard}>
              <Card.Content>
                <View style={styles.earningHeader}>
                  <Text style={styles.platformBadge}>{earning.platform?.name || 'Unknown Platform'}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.earningAmount}>+S${earning.amount.toFixed(2)}</Text>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteEarning(earning.id)}
                      iconColor={theme.colors.onErrorContainer}
                      style={styles.deleteButton}
                    />
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripType}>{earning.notes || 'Earning'}</Text>
                  <Text style={styles.tripTime}>
                    {earning.startTime ? new Date(`2000-01-01T${earning.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </Text>
                </View>
                <View style={styles.tripStats}>
                  {earning.distance && <Text style={styles.tripStat}>{earning.distance}km</Text>}
                  {earning.workingHours && <Text style={styles.tripStat}>{earning.workingHours}h</Text>}
                  <Text style={styles.tripStat}>{new Date(earning.date).toLocaleDateString()}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Earning FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Earning"
        color={theme.colors.onPrimary}
        customSize={56}
        onPress={() => {
          navigation.navigate('EarningEntry', {});
        }}
      />
    </View>
  );
};

export default EarningsScreen;
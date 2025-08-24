import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  FAB,
  Chip,
  Portal,
  Modal,
  List,
  Text,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@types/index';

import { useAppSelector } from '@store/store';
import { APP_CONFIG } from '@constants/index';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user } = useAppSelector(state => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch latest data
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  // Mock data - replace with actual data from store
  const dashboardData = {
    todayEarnings: 180.50,
    todayExpenses: 45.30,
    weeklyEarnings: 1250.00,
    weeklyExpenses: 320.75,
    monthlyEarnings: 5200.00,
    monthlyExpenses: 1450.25,
    netIncome: 3749.75,
    totalTrips: 156,
    avgTripEarning: 33.33,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    greeting: {
      marginBottom: 20,
    },
    greetingText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 4,
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      marginHorizontal: 4,
      padding: 16,
    },
    cardIcon: {
      alignSelf: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 4,
      color: theme.colors.onSurfaceVariant,
    },
    cardAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    earningAmount: {
      color: theme.colors.primary,
    },
    expenseAmount: {
      color: theme.colors.error,
    },
    netIncomeCard: {
      marginBottom: 16,
      padding: 20,
      backgroundColor: theme.colors.primaryContainer,
    },
    netIncomeTitle: {
      fontSize: 16,
      color: theme.colors.onPrimaryContainer,
      marginBottom: 8,
    },
    netIncomeAmount: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.onPrimaryContainer,
    },
    netIncomeSubtitle: {
      fontSize: 12,
      color: theme.colors.onPrimaryContainer,
      opacity: 0.8,
    },
    statsCard: {
      marginBottom: 16,
      padding: 16,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    statsLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    statsValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
    },
    quickActionsModal: {
      backgroundColor: 'white',
      margin: 20,
      borderRadius: 12,
      paddingTop: 20,
    },
    quickActionsTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 16,
      color: theme.colors.onSurface,
    },
    quickActionItem: {
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    cancelButton: {
      margin: 16,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Title style={styles.greetingText}>
            Good morning, {user?.name?.split(' ')[0] || 'Driver'}!
          </Title>
          <Paragraph style={styles.dateText}>
            {new Date().toLocaleDateString('en-SG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Paragraph>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <MaterialCommunityIcons
              name="cash-plus"
              size={24}
              color={theme.colors.primary}
              style={styles.cardIcon}
            />
            <Paragraph style={styles.cardTitle}>Today's Earnings</Paragraph>
            <Title style={[styles.cardAmount, styles.earningAmount]}>
              {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.todayEarnings.toFixed(2)}
            </Title>
          </Card>
          
          <Card style={styles.summaryCard}>
            <MaterialCommunityIcons
              name="cash-minus"
              size={24}
              color={theme.colors.error}
              style={styles.cardIcon}
            />
            <Paragraph style={styles.cardTitle}>Today's Expenses</Paragraph>
            <Title style={[styles.cardAmount, styles.expenseAmount]}>
              {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.todayExpenses.toFixed(2)}
            </Title>
          </Card>
        </View>

        {/* Net Income Card */}
        <Card style={styles.netIncomeCard}>
          <Paragraph style={styles.netIncomeTitle}>This Month's Net Income</Paragraph>
          <Title style={styles.netIncomeAmount}>
            {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.netIncome.toFixed(2)}
          </Title>
          <Paragraph style={styles.netIncomeSubtitle}>
            {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.monthlyEarnings.toFixed(2)} earned • {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.monthlyExpenses.toFixed(2)} spent
          </Paragraph>
        </Card>

        {/* Weekly Statistics */}
        <Card style={styles.statsCard}>
          <Title style={styles.statsTitle}>This Week</Title>
          <View style={styles.statsRow}>
            <Paragraph style={styles.statsLabel}>Total Earnings</Paragraph>
            <Paragraph style={[styles.statsValue, styles.earningAmount]}>
              {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.weeklyEarnings.toFixed(2)}
            </Paragraph>
          </View>
          <View style={styles.statsRow}>
            <Paragraph style={styles.statsLabel}>Total Expenses</Paragraph>
            <Paragraph style={[styles.statsValue, styles.expenseAmount]}>
              {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.weeklyExpenses.toFixed(2)}
            </Paragraph>
          </View>
          <View style={styles.statsRow}>
            <Paragraph style={styles.statsLabel}>Total Trips</Paragraph>
            <Paragraph style={styles.statsValue}>
              {dashboardData.totalTrips}
            </Paragraph>
          </View>
          <View style={styles.statsRow}>
            <Paragraph style={styles.statsLabel}>Average per Trip</Paragraph>
            <Paragraph style={styles.statsValue}>
              {APP_CONFIG.CURRENCY_SYMBOL}{dashboardData.avgTripEarning.toFixed(2)}
            </Paragraph>
          </View>
          
          <View style={styles.chipContainer}>
            <Chip icon="trending-up" mode="outlined" compact>
              +12% vs last week
            </Chip>
            <Chip icon="car" mode="outlined" compact>
              {dashboardData.totalTrips} trips
            </Chip>
          </View>
        </Card>
      </ScrollView>

      {/* Quick Action FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Entry"
        onPress={() => setShowQuickActions(true)}
      />

      {/* Quick Actions Modal */}
      <Portal>
        <Modal
          visible={showQuickActions}
          onDismiss={() => setShowQuickActions(false)}
          contentContainerStyle={styles.quickActionsModal}
        >
          <Text style={styles.quickActionsTitle}>Add New Entry</Text>
          
          <List.Item
            title="Add Expense"
            description="Track fuel, maintenance, meals, etc."
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="cash-minus"
                size={24}
                color={theme.colors.error}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={() => {
              setShowQuickActions(false);
              // @ts-ignore - Navigation to nested stack navigator
              navigation.navigate('ExpensesStack', {
                screen: 'ExpenseEntry',
                params: {},
              });
            }}
            style={styles.quickActionItem}
          />
          
          <List.Item
            title="Add Earning"
            description="Log trip earnings, bonuses, incentives"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="cash-plus"
                size={24}
                color={theme.colors.primary}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={() => {
              setShowQuickActions(false);
              // @ts-ignore - Navigation to nested stack navigator
              navigation.navigate('EarningsStack', {
                screen: 'EarningEntry',
                params: {},
              });
            }}
            style={styles.quickActionItem}
          />
          
          <List.Item
            title="Capture Receipt"
            description="Photo scan for automatic processing"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="camera"
                size={24}
                color={theme.colors.tertiary}
              />
            )}
            right={(props) => (
              <MaterialCommunityIcons
                {...props}
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            )}
            onPress={() => {
              setShowQuickActions(false);
              // @ts-ignore - Navigation to nested stack navigator
              navigation.navigate('ReceiptsStack', {
                screen: 'ReceiptCapture',
                params: {},
              });
            }}
            style={styles.quickActionItem}
          />
          
          <Button
            mode="outlined"
            onPress={() => setShowQuickActions(false)}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default DashboardScreen;
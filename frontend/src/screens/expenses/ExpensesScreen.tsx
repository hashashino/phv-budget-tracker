import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, FAB, Chip, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExpensesStackParamList } from '@types/index';
import { expenseService, Expense } from '@/services/api/expenseService';

type ExpensesScreenNavigationProp = NativeStackNavigationProp<ExpensesStackParamList, 'ExpensesList'>;

const ExpensesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<ExpensesScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses from API
  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseService.getExpenses({ limit: 100 });
      if (response.success && response.data?.expenses) {
        setExpenses(response.data.expenses);
      } else {
        setExpenses([]);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setError('Failed to load expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load expenses when component mounts
  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDeleteExpense = async (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseService.deleteExpense(expenseId);
              setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
            } catch (err) {
              console.error('Failed to delete expense:', err);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          }
        }
      ]
    );
  };

  const categories = ['All', 'Fuel', 'Parking', 'Maintenance', 'ERP/Toll', 'Food', 'Insurance'];
  
  const filteredExpenses = selectedFilter === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category?.name === selectedFilter);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
    filterContainer: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    expenseCard: {
      margin: 8,
      marginHorizontal: 16,
    },
    expenseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    expenseAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.error,
    },
    expenseCategory: {
      fontSize: 14,
      color: theme.colors.onErrorContainer,
      backgroundColor: theme.colors.errorContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      fontWeight: '600',
      alignSelf: 'flex-start',
    },
    expenseDescription: {
      fontSize: 16,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    expenseDate: {
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
    deleteButton: {
      backgroundColor: theme.colors.errorContainer,
      borderRadius: 20,
    },
    receiptIndicator: {
      fontSize: 12,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>PHV Expenses</Text>
        <Text style={styles.subtitle}>Track your driving expenses</Text>
      </View>

      {/* Total Expenses Card */}
      <Card style={styles.totalCard}>
        <Text style={styles.totalAmount}>-S${totalExpenses.toFixed(2)}</Text>
        <Text>Total {selectedFilter !== 'All' ? selectedFilter : ''} Expenses</Text>
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

      {/* Expenses List */}
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>Loading expenses...</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
            <Button mode="contained" onPress={loadExpenses}>Retry</Button>
          </View>
        ) : filteredExpenses.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Text style={{ color: theme.colors.onSurface, textAlign: 'center' }}>No expenses found</Text>
          </View>
        ) : (
          filteredExpenses.map((expense) => (
          <Card key={expense.id} style={styles.expenseCard}>
            <Card.Content>
              <View style={styles.expenseHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseCategory}>{expense.category?.name || 'Uncategorized'}</Text>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.expenseAmount}>-S${expense.amount.toFixed(2)}</Text>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDeleteExpense(expense.id)}
                    iconColor={theme.colors.onErrorContainer}
                    style={styles.deleteButton}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.expenseDate}>{expense.date}</Text>
                {expense.receiptId && (
                  <Text style={styles.receiptIndicator}>📄 Receipt</Text>
                )}
              </View>
            </Card.Content>
          </Card>
          ))
        )}
      </ScrollView>

      {/* Add Expense FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Expense"
        onPress={() => {
          navigation.navigate('ExpenseEntry', {});
        }}
      />
    </View>
  );
};

export default ExpensesScreen;
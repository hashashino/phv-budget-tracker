import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, FAB, Chip, useTheme } from 'react-native-paper';

const ExpensesScreen: React.FC = () => {
  const theme = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Sample PHV expenses data
  const expenses = [
    { id: 1, date: '2025-08-23', category: 'Fuel', amount: 85.50, description: 'Shell Station Jurong', receipt: true },
    { id: 2, date: '2025-08-22', category: 'Parking', amount: 12.00, description: 'CBD Parking', receipt: false },
    { id: 3, date: '2025-08-22', category: 'Maintenance', amount: 150.00, description: 'Car Servicing', receipt: true },
    { id: 4, date: '2025-08-21', category: 'ERP/Toll', amount: 8.50, description: 'ERP Charges', receipt: false },
    { id: 5, date: '2025-08-21', category: 'Food', amount: 25.80, description: 'Lunch Break', receipt: true },
  ];

  const categories = ['All', 'Fuel', 'Parking', 'Maintenance', 'ERP/Toll', 'Food', 'Insurance'];
  
  const filteredExpenses = selectedFilter === 'All' 
    ? expenses 
    : expenses.filter(expense => expense.category === selectedFilter);

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
      color: theme.colors.primary,
      fontWeight: '500',
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
    receiptIndicator: {
      fontSize: 12,
      color: theme.colors.tertiary,
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
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} style={styles.expenseCard}>
            <Card.Content>
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseAmount}>-S${expense.amount.toFixed(2)}</Text>
              </View>
              <Text style={styles.expenseDescription}>{expense.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.expenseDate}>{expense.date}</Text>
                {expense.receipt && (
                  <Text style={styles.receiptIndicator}>📄 Receipt</Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add Expense FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Expense"
        onPress={() => {
          // TODO: Navigate to add expense screen
          console.log('Add expense pressed');
        }}
      />
    </View>
  );
};

export default ExpensesScreen;
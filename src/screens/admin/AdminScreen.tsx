import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { 
  ActivityIndicator, 
  Avatar, 
  Card, 
  Chip, 
  IconButton, 
  List, 
  Text, 
  Title, 
  useTheme 
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchUsers } from '@/store/slices/adminSlice';
import { User, UserRole } from '@/types';

const RoleChip = ({ role }: { role: UserRole }) => {
  const theme = useTheme();
  const roleColors: Record<UserRole, string> = {
    USER: theme.colors.secondary,
    CUSTOMER_SUPPORT: theme.colors.tertiary,
    OPERATIONS_ADMIN: theme.colors.primary,
    TECHNICAL_ADMIN: theme.colors.surfaceVariant,
    FINANCE_MANAGER: theme.colors.error,
    SUPER_ADMIN: theme.colors.errorContainer,
  };

  return (
    <Chip 
      icon="account-tie" 
      style={{ backgroundColor: roleColors[role] || theme.colors.secondary, marginRight: 8 }}
      textStyle={{ color: theme.colors.onSecondaryContainer }}
    >
      {role}
    </Chip>
  );
};

const AdminScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { users, isLoading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const renderUserItem = ({ item }: { item: User }) => (
    <List.Item
      title={`${item.firstName} ${item.lastName}`}
      description={item.email}
      left={() => <Avatar.Text size={40} label={`${item.firstName?.[0] || ''}${item.lastName?.[0] || ''}`} style={{ marginRight: 16 }} />}
      right={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RoleChip role={item.role} />
          <IconButton icon="dots-vertical" onPress={() => console.log('More options for', item.id)} />
        </View>
      )}
      style={styles.listItem}
    />
  );

  if (isLoading) {
    return <ActivityIndicator animating={true} size="large" style={styles.centered} />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>Error: {error}</Text>
        <Button onPress={() => dispatch(fetchUsers())}>Try Again</Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Subscriber Management</Title>
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    paddingVertical: 8,
  },
});

export default AdminScreen;

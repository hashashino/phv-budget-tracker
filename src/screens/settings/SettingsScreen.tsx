import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  List, 
  Switch, 
  Button, 
  useTheme, 
  Divider,
  Avatar,
  IconButton,
  Surface,
  Dialog,
  Portal
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@store/store';
import { clearAuth, logoutUser } from '@store/slices/authSlice';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handleLogout = () => {
    setLogoutDialog(false);
    dispatch(logoutUser());
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Profile Information',
          description: 'Update your personal details',
          icon: 'account-circle',
          onPress: () => console.log('Profile pressed'),
        },
        {
          title: 'Vehicle Details',
          description: 'Manage your vehicle information',
          icon: 'car',
          onPress: () => console.log('Vehicle pressed'),
        },
        {
          title: 'License & Documents',
          description: 'Update your driving credentials',
          icon: 'card-account-details',
          onPress: () => console.log('Documents pressed'),
        },
      ],
    },
    {
      title: 'Banking & Finance',
      items: [
        {
          title: 'Bank Accounts',
          description: 'Connect your Singapore bank accounts',
          icon: 'bank',
          onPress: () => console.log('Banking pressed'),
          badge: '3 connected',
        },
        {
          title: 'Platform Integration',
          description: 'Connect Grab, TADA, Gojek accounts',
          icon: 'link-variant',
          onPress: () => console.log('Platform pressed'),
          badge: '2 connected',
        },
        {
          title: 'Tax Settings',
          description: 'Configure GST and income tax options',
          icon: 'calculator',
          onPress: () => console.log('Tax pressed'),
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          title: 'Export Data',
          description: 'Download your financial records',
          icon: 'download',
          onPress: () => console.log('Export pressed'),
        },
        {
          title: 'Data Backup',
          description: 'Cloud backup and sync settings',
          icon: 'cloud-upload',
          onPress: () => console.log('Backup pressed'),
        },
        {
          title: 'Privacy Policy',
          description: 'Review our privacy policy',
          icon: 'shield-check',
          onPress: () => console.log('Privacy pressed'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          description: 'Get help and tutorials',
          icon: 'help-circle',
          onPress: () => console.log('Help pressed'),
        },
        {
          title: 'Contact Support',
          description: 'Reach out to our support team',
          icon: 'message-text',
          onPress: () => console.log('Contact pressed'),
        },
        {
          title: 'Rate App',
          description: 'Rate us on the App Store',
          icon: 'star',
          onPress: () => console.log('Rate pressed'),
        },
      ],
    },
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
    profileCard: {
      margin: 16,
      padding: 20,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    profileEmail: {
      fontSize: 14,
      color: theme.colors.onSurface,
      opacity: 0.7,
    },
    profileStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
      marginTop: 2,
    },
    section: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      textTransform: 'uppercase',
    },
    card: {
      marginHorizontal: 16,
      marginBottom: 8,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    settingDescription: {
      fontSize: 12,
      color: theme.colors.onSurface,
      opacity: 0.7,
      marginTop: 2,
    },
    settingBadge: {
      backgroundColor: theme.colors.primaryContainer,
      color: theme.colors.onPrimaryContainer,
      fontSize: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginTop: 4,
    },
    switchContainer: {
      marginLeft: 12,
    },
    preferencesCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
    },
    preferencesTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 12,
    },
    preferenceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    preferenceLabel: {
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    logoutCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      backgroundColor: theme.colors.errorContainer,
    },
    logoutButton: {
      margin: 0,
    },
    dialogActions: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Text size={64} label={user?.name?.charAt(0) || 'U'} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'PHV Driver'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'driver@example.com'}</Text>
            </View>
            <IconButton icon="pencil" onPress={() => console.log('Edit profile')} />
          </View>
          
          <Divider />
          
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>S$3,749</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </Card>

        {/* App Preferences */}
        <Card style={styles.preferencesCard}>
          <Text style={styles.preferencesTitle}>App Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Push Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Auto Sync</Text>
            <Switch value={autoSync} onValueChange={setAutoSync} />
          </View>
          
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Biometric Login</Text>
            <Switch value={biometric} onValueChange={setBiometric} />
          </View>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={props => (
                      <MaterialCommunityIcons
                        {...props}
                        name={item.icon as any}
                        size={24}
                        color={theme.colors.onSurface}
                        style={styles.settingIcon}
                      />
                    )}
                    right={props => (
                      <View style={{ alignItems: 'flex-end' }}>
                        {item.badge && (
                          <Text style={styles.settingBadge}>{item.badge}</Text>
                        )}
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={24}
                          color={theme.colors.onSurface}
                        />
                      </View>
                    )}
                    onPress={item.onPress}
                  />
                  {itemIndex < section.items.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout */}
        <Card style={styles.logoutCard}>
          <Button
            mode="contained-tonal"
            icon="logout"
            onPress={() => setLogoutDialog(true)}
            buttonColor={theme.colors.errorContainer}
            textColor={theme.colors.onErrorContainer}
            style={styles.logoutButton}
          >
            Sign Out
          </Button>
        </Card>

        {/* App Version */}
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 12, color: theme.colors.onBackground, opacity: 0.5 }}>
            PHV Budget Tracker v1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={logoutDialog} onDismiss={() => setLogoutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to sign out of your account?</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={() => setLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} mode="contained">Sign Out</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default SettingsScreen;
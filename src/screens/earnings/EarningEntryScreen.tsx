import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import {
  Card,
  Title,
  TextInput,
  Button,
  Chip,
  useTheme,
  Portal,
  Modal,
  List,
  Text,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAppDispatch } from '@store/store';
import { createEarning } from '@store/slices/earningSlice';
import { EarningFormData, EarningSource, Platform } from '@types/index';
import { validateAmount } from '@utils/index';

const validationSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .test('valid-amount', 'Please enter a valid amount', validateAmount),
  platform: Yup.string().required('Platform is required'),
  date: Yup.date().required('Date is required'),
});

interface EarningEntryScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialPlatform?: Platform;
    };
  };
}

const EarningEntryScreen: React.FC<EarningEntryScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms: Platform[] = ['grab', 'gojek', 'tada', 'comfort_delgro', 'uber', 'other'];
  const sources: EarningSource[] = ['trip', 'bonus', 'incentive', 'referral', 'other'];

  const platformLabels: Record<Platform, string> = {
    grab: 'Grab',
    gojek: 'Gojek',
    tada: 'TADA',
    comfort_delgro: 'ComfortDelGro',
    uber: 'Uber',
    other: 'Other'
  };

  const sourceLabels: Record<EarningSource, string> = {
    trip: 'Trip Earning',
    bonus: 'Bonus',
    incentive: 'Incentive',
    referral: 'Referral',
    other: 'Other'
  };

  const initialValues: EarningFormData = {
    amount: '',
    source: 'trip',
    platform: route?.params?.initialPlatform || 'grab',
    date: new Date(),
    startLocation: '',
    endLocation: '',
    duration: '',
    distance: '',
    tips: '',
  };

  const handleSubmit = async (values: EarningFormData) => {
    try {
      setIsSubmitting(true);
      
      const earningData = {
        ...values,
        amount: parseFloat(values.amount),
        duration: values.duration ? parseFloat(values.duration) : undefined,
        distance: values.distance ? parseFloat(values.distance) : undefined,
        tips: values.tips ? parseFloat(values.tips) : undefined,
      };

      await dispatch(createEarning(earningData)).unwrap();

      Alert.alert(
        'Success',
        'Earning added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add earning. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
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
    formCard: {
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: theme.colors.onSurface,
    },
    inputContainer: {
      marginBottom: 16,
    },
    amountInput: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    platformButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    platformText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
    },
    sourceButtons: {
      marginVertical: 8,
    },
    submitButton: {
      marginTop: 24,
      paddingVertical: 8,
    },
    modal: {
      backgroundColor: 'white',
      margin: 20,
      borderRadius: 8,
      maxHeight: '70%',
    },
    modalTitle: {
      padding: 16,
      fontSize: 20,
      fontWeight: 'bold',
    },
    platformItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
  });

  return (
    <View style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikSubmit }) => {
          
          const handleDateChange = (event: any, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFieldValue('date', selectedDate);
            }
          };

          return (
            <>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <Card style={styles.formCard}>
                <Title style={styles.title}>Add Earning</Title>

                {/* Amount Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Amount (SGD)"
                    value={values.amount}
                    onChangeText={handleChange('amount')}
                    onBlur={handleBlur('amount')}
                    keyboardType="decimal-pad"
                    mode="outlined"
                    style={styles.amountInput}
                    left={<TextInput.Icon icon="currency-usd" />}
                    error={touched.amount && !!errors.amount}
                    placeholder="0.00"
                  />
                  {touched.amount && errors.amount && (
                    <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                      {errors.amount}
                    </Text>
                  )}
                </View>

                {/* Source Selection */}
                <View style={styles.inputContainer}>
                  <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                    Source
                  </Text>
                  <SegmentedButtons
                    value={values.source}
                    onValueChange={(value) => setFieldValue('source', value)}
                    buttons={sources.map(source => ({
                      value: source,
                      label: sourceLabels[source],
                    }))}
                    style={styles.sourceButtons}
                  />
                </View>

                {/* Platform Selection */}
                <View style={styles.inputContainer}>
                  <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                    Platform
                  </Text>
                  <Pressable
                    style={styles.platformButton}
                    onPress={() => setShowPlatformModal(true)}
                  >
                    <Text style={styles.platformText}>
                      {platformLabels[values.platform]}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>

                {/* Date Selection */}
                <View style={styles.inputContainer}>
                  <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                    Date
                  </Text>
                  <Pressable
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.platformText}>
                      {values.date.toLocaleDateString('en-SG')}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={24}
                      color={theme.colors.onSurfaceVariant}
                    />
                  </Pressable>
                </View>

                {/* Trip Details (only for trip earnings) */}
                {values.source === 'trip' && (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Start Location (Optional)"
                        value={values.startLocation}
                        onChangeText={handleChange('startLocation')}
                        onBlur={handleBlur('startLocation')}
                        mode="outlined"
                        placeholder="e.g., Jurong East"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        label="End Location (Optional)"
                        value={values.endLocation}
                        onChangeText={handleChange('endLocation')}
                        onBlur={handleBlur('endLocation')}
                        mode="outlined"
                        placeholder="e.g., Marina Bay"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Distance (km)"
                        value={values.distance}
                        onChangeText={handleChange('distance')}
                        onBlur={handleBlur('distance')}
                        keyboardType="decimal-pad"
                        mode="outlined"
                        placeholder="0.0"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Duration (minutes)"
                        value={values.duration}
                        onChangeText={handleChange('duration')}
                        onBlur={handleBlur('duration')}
                        keyboardType="decimal-pad"
                        mode="outlined"
                        placeholder="0"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Tips (SGD)"
                        value={values.tips}
                        onChangeText={handleChange('tips')}
                        onBlur={handleBlur('tips')}
                        keyboardType="decimal-pad"
                        mode="outlined"
                        placeholder="0.00"
                      />
                    </View>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={() => formikSubmit()}
                  style={styles.submitButton}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  icon="check"
                >
                  {isSubmitting ? 'Adding Earning...' : 'Add Earning'}
                </Button>
              </Card>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={values.date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </ScrollView>

              {/* Platform Selection Modal */}
              <Portal>
                <Modal
                  visible={showPlatformModal}
                  onDismiss={() => setShowPlatformModal(false)}
                  contentContainerStyle={styles.modal}
                >
                  <Text style={styles.modalTitle}>Select Platform</Text>
                  <ScrollView>
                    {platforms.map((platform) => (
                      <List.Item
                        key={platform}
                        title={platformLabels[platform]}
                        onPress={() => {
                          setFieldValue('platform', platform);
                          setShowPlatformModal(false);
                        }}
                        style={styles.platformItem}
                      />
                    ))}
                  </ScrollView>
                </Modal>
              </Portal>
            </>
          );
        }}
      </Formik>
    </View>
  );
};

export default EarningEntryScreen;
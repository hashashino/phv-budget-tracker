import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  Image,
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
  IconButton,
  Text,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAppDispatch } from '@store/store';
import { createExpense } from '@store/slices/expenseSlice';
import { ExpenseFormData, ExpenseCategory } from '@types/index';
import { EXPENSE_CATEGORIES } from '@constants/index';
import { cameraService } from '@services/camera/cameraService';
import { formatCurrency, validateAmount } from '@utils/index';

const validationSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .test('valid-amount', 'Please enter a valid amount', validateAmount),
  category: Yup.string().required('Category is required'),
  description: Yup.string()
    .min(3, 'Description must be at least 3 characters')
    .max(100, 'Description cannot exceed 100 characters'),
  date: Yup.date().required('Date is required'),
});

interface ExpenseEntryScreenProps {
  navigation: any;
  route?: {
    params?: {
      initialCategory?: ExpenseCategory;
      receiptImage?: string;
    };
  };
}

const ExpenseEntryScreen: React.FC<ExpenseEntryScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(
    route?.params?.receiptImage || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: ExpenseFormData = {
    amount: '',
    category: route?.params?.initialCategory || 'fuel',
    description: '',
    date: new Date(),
    receiptImage: receiptImage,
    isRecurring: false,
    tags: [],
  };

  const handleSubmit = async (values: ExpenseFormData) => {
    try {
      setIsSubmitting(true);
      
      await dispatch(createExpense({
        ...values,
        amount: parseFloat(values.amount),
      })).unwrap();

      Alert.alert(
        'Success',
        'Expense added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to add expense. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptureReceipt = async () => {
    try {
      const image = await cameraService.showImagePicker({
        quality: 0.8,
        allowsEditing: true,
      });

      if (image) {
        setReceiptImage(image.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture receipt image');
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
    categoryButton: {
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
    categoryText: {
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
    receiptSection: {
      marginTop: 16,
    },
    receiptButton: {
      marginTop: 8,
    },
    receiptPreview: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginTop: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
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
    categoryItem: {
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
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Card style={styles.formCard}>
              <Title style={styles.title}>Add Expense</Title>

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

              {/* Category Selection */}
              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                  Category
                </Text>
                <Pressable
                  style={styles.categoryButton}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons
                      name={EXPENSE_CATEGORIES[values.category].icon}
                      size={24}
                      color={EXPENSE_CATEGORIES[values.category].color}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={styles.categoryText}>
                      {EXPENSE_CATEGORIES[values.category].label}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>

              {/* Description Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Enter expense description..."
                  error={touched.description && !!errors.description}
                />
                {touched.description && errors.description && (
                  <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
                    {errors.description}
                  </Text>
                )}
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
                  <Text style={styles.categoryText}>
                    {values.date.toLocaleDateString('en-SG')}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>

              {/* Receipt Section */}
              <View style={styles.receiptSection}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Receipt (Optional)
                </Text>
                
                {receiptImage ? (
                  <View>
                    <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                    <Button
                      mode="outlined"
                      icon="camera-retake"
                      style={styles.receiptButton}
                      onPress={handleCaptureReceipt}
                    >
                      Retake Photo
                    </Button>
                  </View>
                ) : (
                  <Button
                    mode="outlined"
                    icon="camera"
                    style={styles.receiptButton}
                    onPress={handleCaptureReceipt}
                  >
                    Capture Receipt
                  </Button>
                )}
              </View>

              {/* Tags */}
              <View style={styles.inputContainer}>
                <Text variant="labelMedium" style={{ marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                  Quick Tags
                </Text>
                <View style={styles.tagsContainer}>
                  {['Business', 'Personal', 'Urgent', 'Tax Deductible'].map((tag) => (
                    <Chip
                      key={tag}
                      mode={values.tags.includes(tag) ? 'flat' : 'outlined'}
                      selected={values.tags.includes(tag)}
                      onPress={() => {
                        const newTags = values.tags.includes(tag)
                          ? values.tags.filter(t => t !== tag)
                          : [...values.tags, tag];
                        setFieldValue('tags', newTags);
                      }}
                      compact
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={() => formikSubmit()}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="check"
              >
                {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
              </Button>
            </Card>
          </ScrollView>
          );
        }}
      </Formik>

      {/* Category Selection Modal */}
      <Portal>
        <Modal
          visible={showCategoryModal}
          onDismiss={() => setShowCategoryModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Select Category</Text>
          <ScrollView>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
              <List.Item
                key={key}
                title={category.label}
                left={(props) => (
                  <MaterialCommunityIcons
                    {...props}
                    name={category.icon}
                    size={24}
                    color={category.color}
                  />
                )}
                onPress={() => {
                  // This will need to be handled differently since setFieldValue is in Formik context
                  setShowCategoryModal(false);
                }}
                style={styles.categoryItem}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

export default ExpenseEntryScreen;
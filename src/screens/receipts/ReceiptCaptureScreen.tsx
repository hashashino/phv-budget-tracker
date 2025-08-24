import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  useTheme,
  IconButton,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppDispatch } from '@store/store';
import { uploadReceipt } from '@store/slices/receiptSlice';
import { cameraService } from '@services/camera/cameraService';

const { width } = Dimensions.get('window');

interface ReceiptCaptureScreenProps {
  navigation: any;
  route?: {
    params?: {
      expenseId?: string;
    };
  };
}

const ReceiptCaptureScreen: React.FC<ReceiptCaptureScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCameraCapture = async () => {
    try {
      const result = await cameraService.showImagePicker({
        quality: 0.9,
        allowsEditing: true,
      });

      if (result) {
        setCapturedImage(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleLibraryPicker = async () => {
    try {
      const result = await cameraService.showImagePicker({
        quality: 0.9,
        allowsEditing: true,
        mediaTypes: 'Images',
      });

      if (result) {
        setCapturedImage(result.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleUploadReceipt = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please capture or select an image first.');
      return;
    }

    try {
      setIsUploading(true);
      
      const receiptData = {
        image: capturedImage,
        expenseId: route?.params?.expenseId,
      };

      await dispatch(uploadReceipt(receiptData)).unwrap();

      Alert.alert(
        'Success',
        'Receipt uploaded and processing started!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to upload receipt. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

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
    content: {
      flex: 1,
      padding: 16,
    },
    captureArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    previewContainer: {
      width: width - 32,
      height: (width - 32) * 1.4,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: 16,
    },
    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    placeholderContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.outline,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    placeholderIcon: {
      marginBottom: 16,
    },
    placeholderTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    placeholderDescription: {
      fontSize: 14,
      color: theme.colors.onSurface,
      opacity: 0.7,
      textAlign: 'center',
      paddingHorizontal: 32,
      lineHeight: 20,
    },
    actionButtons: {
      gap: 12,
    },
    captureButton: {
      paddingVertical: 8,
    },
    libraryButton: {
      paddingVertical: 8,
    },
    previewActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    retakeButton: {
      flex: 1,
      paddingVertical: 8,
    },
    uploadButton: {
      flex: 2,
      paddingVertical: 8,
    },
    processingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 8,
      marginTop: 16,
    },
    processingText: {
      marginLeft: 12,
      color: theme.colors.onPrimaryContainer,
      fontWeight: '500',
    },
    tipsCard: {
      padding: 16,
      marginTop: 16,
      backgroundColor: theme.colors.secondaryContainer,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSecondaryContainer,
      marginBottom: 8,
    },
    tipsList: {
      gap: 4,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tipBullet: {
      marginTop: 2,
      marginRight: 8,
      color: theme.colors.onSecondaryContainer,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.onSecondaryContainer,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Capture Receipt</Text>
        <Text style={styles.subtitle}>
          Take a photo or select from your gallery
        </Text>
      </View>

      <View style={styles.content}>
        {/* Capture/Preview Area */}
        <View style={styles.captureArea}>
          {capturedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            </View>
          ) : (
            <View style={[styles.previewContainer, styles.placeholderContainer]}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={64}
                color={theme.colors.outline}
                style={styles.placeholderIcon}
              />
              <Text style={styles.placeholderTitle}>No Image Captured</Text>
              <Text style={styles.placeholderDescription}>
                Capture a clear photo of your receipt for automatic text extraction and expense categorization
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {capturedImage ? (
          <View style={styles.previewActions}>
            <Button
              mode="outlined"
              icon="camera-retake"
              onPress={handleRetake}
              style={styles.retakeButton}
              disabled={isUploading}
            >
              Retake
            </Button>
            <Button
              mode="contained"
              icon="upload"
              onPress={handleUploadReceipt}
              style={styles.uploadButton}
              loading={isUploading}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Receipt'}
            </Button>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="camera"
              onPress={handleCameraCapture}
              style={styles.captureButton}
            >
              Take Photo
            </Button>
            <Button
              mode="outlined"
              icon="image"
              onPress={handleLibraryPicker}
              style={styles.libraryButton}
            >
              Choose from Gallery
            </Button>
          </View>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={theme.colors.onPrimaryContainer} />
            <Text style={styles.processingText}>Processing receipt...</Text>
          </View>
        )}

        {/* Tips Card */}
        {!capturedImage && (
          <Card style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📸 Tips for better results:</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Ensure good lighting and avoid shadows</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Keep the receipt flat and fully visible</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Capture the entire receipt including totals</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Text should be clear and readable</Text>
              </View>
            </View>
          </Card>
        )}
      </View>
    </View>
  );
};

export default ReceiptCaptureScreen;
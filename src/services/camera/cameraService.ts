import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

class CameraService {
  private cameraPermissionGranted = false;
  private mediaLibraryPermissionGranted = false;

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      this.cameraPermissionGranted = status === 'granted';
      
      if (!this.cameraPermissionGranted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to capture receipts and screenshots.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ImagePicker.requestCameraPermissionsAsync() }
          ]
        );
      }
      
      return this.cameraPermissionGranted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      this.mediaLibraryPermissionGranted = status === 'granted';
      
      if (!this.mediaLibraryPermissionGranted) {
        Alert.alert(
          'Media Library Permission Required',
          'Please enable photo library access in your device settings to select receipt images.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => MediaLibrary.requestPermissionsAsync() }
          ]
        );
      }
      
      return this.mediaLibraryPermissionGranted;
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  /**
   * Take a photo using camera
   */
  async takePicture(options: CameraOptions = {}): Promise<CapturedImage | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        exif: false,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return this.processImageAsset(asset);
      }

      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
      return null;
    }
  }

  /**
   * Select an image from gallery
   */
  async selectFromGallery(options: CameraOptions = {}): Promise<CapturedImage | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        exif: false,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return this.processImageAsset(asset);
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Show action sheet to choose between camera and gallery
   */
  async showImagePicker(options: CameraOptions = {}): Promise<CapturedImage | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose how you want to add the image',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.takePicture(options);
              resolve(result);
            }
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await this.selectFromGallery(options);
              resolve(result);
            }
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null)
          }
        ]
      );
    });
  }

  /**
   * Take multiple photos for batch processing
   */
  async takeMultiplePictures(count: number = 5): Promise<CapturedImage[]> {
    const images: CapturedImage[] = [];
    
    for (let i = 0; i < count; i++) {
      const image = await this.takePicture({
        quality: 0.7,
        allowsEditing: false,
      });
      
      if (image) {
        images.push(image);
      }
      
      // Ask user if they want to continue
      if (i < count - 1) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Continue?',
            `Image ${i + 1} captured. Take another photo?`,
            [
              { text: 'Done', onPress: () => resolve(false) },
              { text: 'Next Photo', onPress: () => resolve(true) }
            ]
          );
        });
        
        if (!shouldContinue) {
          break;
        }
      }
    }
    
    return images;
  }

  /**
   * Compress image to reduce file size
   */
  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    try {
      const compressed = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: quality,
        allowsEditing: false,
      });

      // For now, return the original URI
      // In a real implementation, you might use a compression library
      return uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  /**
   * Save image to device gallery
   */
  async saveToGallery(uri: string, albumName: string = 'PHV Budget Tracker'): Promise<boolean> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return false;
      }

      // Create album if it doesn't exist
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(albumName);
      }

      // Save the image
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.addAssetsToAlbumAsync([asset], album);

      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  /**
   * Delete image file
   */
  async deleteImage(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Get image information
   */
  async getImageInfo(uri: string): Promise<{
    width: number;
    height: number;
    fileSize: number;
  } | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      if (!fileInfo.exists) {
        return null;
      }

      // Get image dimensions using ImagePicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          width: asset.width,
          height: asset.height,
          fileSize: fileInfo.size || 0,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  /**
   * Process image asset from picker result
   */
  private async processImageAsset(asset: ImagePicker.ImagePickerAsset): Promise<CapturedImage> {
    const fileInfo = await FileSystem.getInfoAsync(asset.uri, { size: true });
    
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileSize: fileInfo.size,
      type: asset.type,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
    };
  }

  /**
   * Check if device has camera
   */
  async hasCamera(): Promise<boolean> {
    try {
      return await Camera.isAvailableAsync();
    } catch {
      return false;
    }
  }

  /**
   * Check permissions status
   */
  async getPermissionsStatus(): Promise<{
    camera: boolean;
    mediaLibrary: boolean;
  }> {
    const [cameraStatus, mediaLibraryStatus] = await Promise.all([
      Camera.getCameraPermissionsAsync(),
      MediaLibrary.getPermissionsAsync(),
    ]);

    return {
      camera: cameraStatus.status === 'granted',
      mediaLibrary: mediaLibraryStatus.status === 'granted',
    };
  }
}

export const cameraService = new CameraService();
export default CameraService;
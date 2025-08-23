import AWS from 'aws-sdk';
import fs from 'fs/promises';
import path from 'path';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';
import sharp from 'sharp';

interface UploadOptions {
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  generateThumbnail?: boolean;
}

class StorageService {
  private s3: AWS.S3 | null = null;
  private isS3Configured = false;

  async initialize(): Promise<void> {
    if (config.storage.type === 's3') {
      if (!config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.s3Bucket) {
        throw new Error('AWS S3 configuration incomplete');
      }

      AWS.config.update({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });

      this.s3 = new AWS.S3();
      this.isS3Configured = true;
      logger.info('AWS S3 storage initialized');
    } else {
      // Ensure local upload directory exists
      await this.ensureDirectoryExists(config.storage.uploadPath);
      logger.info('Local storage initialized', { uploadPath: config.storage.uploadPath });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      // Process image if needed
      let processedBuffer = file.buffer;
      
      if (this.isImageFile(file.mimetype) && options.resize) {
        processedBuffer = await this.processImage(file.buffer, options.resize);
      }

      if (this.isS3Configured && this.s3) {
        return await this.uploadToS3(processedBuffer, file, userId, options);
      } else {
        return await this.uploadToLocal(processedBuffer, file, userId, options);
      }
    } catch (error) {
      logger.error('File upload failed', { error, userId, filename: file.originalname });
      throw new Error('File upload failed');
    }
  }

  private async uploadToS3(
    buffer: Buffer,
    file: Express.Multer.File,
    userId: string,
    options: UploadOptions
  ): Promise<string> {
    if (!this.s3) {
      throw new Error('S3 not initialized');
    }

    const key = this.generateFileName(file, userId);
    
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3Bucket!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        userId,
        uploadedAt: new Date().toISOString(),
      },
    };

    const result = await this.s3.upload(uploadParams).promise();

    // Generate thumbnail if requested
    if (options.generateThumbnail && this.isImageFile(file.mimetype)) {
      await this.generateThumbnail(buffer, file, userId, key);
    }

    logger.info('File uploaded to S3', { userId, key, bucket: config.aws.s3Bucket });
    return result.Location;
  }

  private async uploadToLocal(
    buffer: Buffer,
    file: Express.Multer.File,
    userId: string,
    options: UploadOptions
  ): Promise<string> {
    const userUploadDir = path.join(config.storage.uploadPath, userId);
    await this.ensureDirectoryExists(userUploadDir);

    const fileName = this.generateFileName(file, userId);
    const filePath = path.join(userUploadDir, fileName);

    await fs.writeFile(filePath, buffer);

    // Generate thumbnail if requested
    if (options.generateThumbnail && this.isImageFile(file.mimetype)) {
      await this.generateThumbnail(buffer, file, userId, fileName);
    }

    logger.info('File uploaded locally', { userId, filePath });
    return `/uploads/${userId}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (this.isS3Configured && this.s3 && fileUrl.startsWith('https://')) {
        await this.deleteFromS3(fileUrl);
      } else {
        await this.deleteFromLocal(fileUrl);
      }
    } catch (error) {
      logger.error('File deletion failed', { error, fileUrl });
      throw new Error('File deletion failed');
    }
  }

  private async deleteFromS3(fileUrl: string): Promise<void> {
    if (!this.s3) {
      throw new Error('S3 not initialized');
    }

    // Extract key from URL
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Get last two parts (userId/filename)

    const deleteParams: AWS.S3.DeleteObjectRequest = {
      Bucket: config.aws.s3Bucket!,
      Key: key,
    };

    await this.s3.deleteObject(deleteParams).promise();
    logger.info('File deleted from S3', { key });
  }

  private async deleteFromLocal(fileUrl: string): Promise<void> {
    // Convert URL to file path
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(config.storage.uploadPath, relativePath);

    try {
      await fs.unlink(filePath);
      
      // Also delete thumbnail if exists
      const thumbnailPath = this.getThumbnailPath(filePath);
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Ignore if thumbnail doesn't exist
      }
      
      logger.info('File deleted locally', { filePath });
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async getFile(fileUrl: string): Promise<Buffer> {
    if (this.isS3Configured && this.s3 && fileUrl.startsWith('https://')) {
      return this.getFromS3(fileUrl);
    } else {
      return this.getFromLocal(fileUrl);
    }
  }

  private async getFromS3(fileUrl: string): Promise<Buffer> {
    if (!this.s3) {
      throw new Error('S3 not initialized');
    }

    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(-2).join('/');

    const getParams: AWS.S3.GetObjectRequest = {
      Bucket: config.aws.s3Bucket!,
      Key: key,
    };

    const result = await this.s3.getObject(getParams).promise();
    return result.Body as Buffer;
  }

  private async getFromLocal(fileUrl: string): Promise<Buffer> {
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(config.storage.uploadPath, relativePath);
    return fs.readFile(filePath);
  }

  private async processImage(
    buffer: Buffer,
    options: { width?: number; height?: number; quality?: number }
  ): Promise<Buffer> {
    let transformer = sharp(buffer);

    if (options.width || options.height) {
      transformer = transformer.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (options.quality) {
      transformer = transformer.jpeg({ quality: options.quality });
    }

    return transformer.toBuffer();
  }

  private async generateThumbnail(
    buffer: Buffer,
    file: Express.Multer.File,
    userId: string,
    originalKey: string
  ): Promise<void> {
    try {
      const thumbnailBuffer = await sharp(buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const thumbnailKey = this.getThumbnailKey(originalKey);

      if (this.isS3Configured && this.s3) {
        const uploadParams: AWS.S3.PutObjectRequest = {
          Bucket: config.aws.s3Bucket!,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          Metadata: {
            originalKey,
            userId,
            type: 'thumbnail',
          },
        };

        await this.s3.upload(uploadParams).promise();
      } else {
        const userUploadDir = path.join(config.storage.uploadPath, userId);
        const thumbnailPath = path.join(userUploadDir, 'thumbnails');
        await this.ensureDirectoryExists(thumbnailPath);

        const thumbnailFilePath = path.join(thumbnailPath, this.getFileNameFromKey(thumbnailKey));
        await fs.writeFile(thumbnailFilePath, thumbnailBuffer);
      }

      logger.debug('Thumbnail generated', { originalKey, thumbnailKey });
    } catch (error) {
      logger.error('Thumbnail generation failed', { error, originalKey });
      // Don't throw error as thumbnail is optional
    }
  }

  private generateFileName(file: Express.Multer.File, userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = path.extname(file.originalname);
    return `${timestamp}_${random}${extension}`;
  }

  private getThumbnailKey(originalKey: string): string {
    const parts = originalKey.split('/');
    const fileName = parts[parts.length - 1];
    const nameWithoutExt = path.parse(fileName).name;
    return `${parts.slice(0, -1).join('/')}/thumbnails/${nameWithoutExt}_thumb.jpg`;
  }

  private getThumbnailPath(originalPath: string): string {
    const dir = path.dirname(originalPath);
    const nameWithoutExt = path.parse(originalPath).name;
    return path.join(dir, 'thumbnails', `${nameWithoutExt}_thumb.jpg`);
  }

  private getFileNameFromKey(key: string): string {
    return key.split('/').pop() || '';
  }

  private isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as any).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  // Utility methods
  async getFileStats(fileUrl: string): Promise<{
    size: number;
    lastModified: Date;
    contentType?: string;
  }> {
    if (this.isS3Configured && this.s3 && fileUrl.startsWith('https://')) {
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(-2).join('/');

      const headParams: AWS.S3.HeadObjectRequest = {
        Bucket: config.aws.s3Bucket!,
        Key: key,
      };

      const result = await this.s3.headObject(headParams).promise();
      return {
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        contentType: result.ContentType,
      };
    } else {
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(config.storage.uploadPath, relativePath);
      const stats = await fs.stat(filePath);
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
      };
    }
  }

  async listUserFiles(userId: string): Promise<Array<{
    key: string;
    url: string;
    size: number;
    lastModified: Date;
  }>> {
    if (this.isS3Configured && this.s3) {
      const listParams: AWS.S3.ListObjectsV2Request = {
        Bucket: config.aws.s3Bucket!,
        Prefix: `${userId}/`,
      };

      const result = await this.s3.listObjectsV2(listParams).promise();
      return (result.Contents || []).map(obj => ({
        key: obj.Key || '',
        url: `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${obj.Key}`,
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
      }));
    } else {
      const userDir = path.join(config.storage.uploadPath, userId);
      try {
        const files = await fs.readdir(userDir);
        const fileStats = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(userDir, file);
            const stats = await fs.stat(filePath);
            return {
              key: `${userId}/${file}`,
              url: `/uploads/${userId}/${file}`,
              size: stats.size,
              lastModified: stats.mtime,
            };
          })
        );
        return fileStats;
      } catch {
        return [];
      }
    }
  }
}

export const storageService = new StorageService();
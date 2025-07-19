import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

interface UploadResult {
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  bytes: number;
  resource_type: string;
}

interface FileUploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number;
  transformation?: any;
}

class FileUploadService {
  // Multer configuration for memory storage
  private getMulterConfig(options: FileUploadOptions = {}) {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: options.maxSize || MAX_FILE_SIZE,
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedTypes = options.allowedTypes || ALLOWED_FILE_TYPES;
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
        }
      },
    });
  }

  // Get multer middleware for single file upload
  public single(fieldName: string, options: FileUploadOptions = {}) {
    return this.getMulterConfig(options).single(fieldName);
  }

  // Get multer middleware for multiple file upload
  public multiple(fieldName: string, maxCount: number = 10, options: FileUploadOptions = {}) {
    return this.getMulterConfig(options).array(fieldName, maxCount);
  }

  // Upload file to Cloudinary
  public async uploadToCloudinary(
    file: Express.Multer.File,
    options: FileUploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const { folder = 'assureme', transformation } = options;

      // Determine resource type based on file type
      const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';

      const uploadOptions: any = {
        folder,
        resource_type: resourceType,
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
        original_filename: file.originalname,
      };

      // Add transformation for images
      if (resourceType === 'image' && transformation) {
        uploadOptions.transformation = transformation;
      }

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve({
                public_id: result.public_id,
                secure_url: result.secure_url,
                original_filename: file.originalname,
                format: result.format,
                bytes: result.bytes,
                resource_type: result.resource_type,
              });
            } else {
              reject(new Error('Upload failed - no result returned'));
            }
          }
        ).end(file.buffer);
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error}`);
    }
  }

  // Upload multiple files to Cloudinary
  public async uploadMultipleToCloudinary(
    files: Express.Multer.File[],
    options: FileUploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map(file => this.uploadToCloudinary(file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error(`Multiple file upload failed: ${error}`);
    }
  }

  // Delete file from Cloudinary
  public async deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
      return false;
    }
  }

  // Delete multiple files from Cloudinary
  public async deleteMultipleFromCloudinary(publicIds: string[]): Promise<boolean> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds);
      return Object.values(result.deleted).every(status => status === 'deleted');
    } catch (error) {
      console.error('Failed to delete multiple files from Cloudinary:', error);
      return false;
    }
  }

  // Get file info from Cloudinary
  public async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error) {
      throw new Error(`Failed to get file info: ${error}`);
    }
  }

  // Generate signed URL for secure access
  public generateSignedUrl(publicId: string, options: any = {}): string {
    const timestamp = Math.round(new Date().getTime() / 1000) + 3600; // 1 hour expiry
    
    return cloudinary.utils.private_download_url(publicId, 'pdf', {
      ...options,
      expires_at: timestamp,
    });
  }

  // Validate file type and size
  public validateFile(file: Express.Multer.File, options: FileUploadOptions = {}): { valid: boolean; error?: string } {
    const allowedTypes = options.allowedTypes || ALLOWED_FILE_TYPES;
    const maxSize = options.maxSize || MAX_FILE_SIZE;

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      };
    }

    return { valid: true };
  }

  // Get file type category
  public getFileCategory(mimetype: string): 'image' | 'document' | 'spreadsheet' | 'other' {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else if (
      mimetype === 'application/pdf' ||
      mimetype === 'application/msword' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'document';
    } else if (
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return 'spreadsheet';
    } else {
      return 'other';
    }
  }

  // Format file size for display
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Test Cloudinary connection
  public async testConnection(): Promise<boolean> {
    try {
      await cloudinary.api.ping();
      console.log('Cloudinary connection verified');
      return true;
    } catch (error) {
      console.error('Cloudinary connection failed:', error);
      return false;
    }
  }
}

export const fileUploadService = new FileUploadService();
export default fileUploadService;
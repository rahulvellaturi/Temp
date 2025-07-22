"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadService = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Configure Cloudinary
cloudinary_1.v2.config({
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
class FileUploadService {
    // Multer configuration for memory storage
    getMulterConfig(options = {}) {
        return (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: {
                fileSize: options.maxSize || MAX_FILE_SIZE,
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = options.allowedTypes || ALLOWED_FILE_TYPES;
                if (allowedTypes.includes(file.mimetype)) {
                    cb(null, true);
                }
                else {
                    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
                }
            },
        });
    }
    // Get multer middleware for single file upload
    single(fieldName, options = {}) {
        return this.getMulterConfig(options).single(fieldName);
    }
    // Get multer middleware for multiple file upload
    multiple(fieldName, maxCount = 10, options = {}) {
        return this.getMulterConfig(options).array(fieldName, maxCount);
    }
    // Upload file to Cloudinary
    async uploadToCloudinary(file, options = {}) {
        try {
            const { folder = 'assureme', transformation } = options;
            // Determine resource type based on file type
            const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
            const uploadOptions = {
                folder,
                resource_type: resourceType,
                public_id: `${Date.now()}-${path_1.default.parse(file.originalname).name}`,
                original_filename: file.originalname,
            };
            // Add transformation for images
            if (resourceType === 'image' && transformation) {
                uploadOptions.transformation = transformation;
            }
            return new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else if (result) {
                        resolve({
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                            original_filename: file.originalname,
                            format: result.format,
                            bytes: result.bytes,
                            resource_type: result.resource_type,
                        });
                    }
                    else {
                        reject(new Error('Upload failed - no result returned'));
                    }
                }).end(file.buffer);
            });
        }
        catch (error) {
            throw new Error(`File upload failed: ${error}`);
        }
    }
    // Upload multiple files to Cloudinary
    async uploadMultipleToCloudinary(files, options = {}) {
        try {
            const uploadPromises = files.map(file => this.uploadToCloudinary(file, options));
            return await Promise.all(uploadPromises);
        }
        catch (error) {
            throw new Error(`Multiple file upload failed: ${error}`);
        }
    }
    // Delete file from Cloudinary
    async deleteFromCloudinary(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result.result === 'ok';
        }
        catch (error) {
            console.error('Failed to delete file from Cloudinary:', error);
            return false;
        }
    }
    // Delete multiple files from Cloudinary
    async deleteMultipleFromCloudinary(publicIds) {
        try {
            const result = await cloudinary_1.v2.api.delete_resources(publicIds);
            return Object.values(result.deleted).every(status => status === 'deleted');
        }
        catch (error) {
            console.error('Failed to delete multiple files from Cloudinary:', error);
            return false;
        }
    }
    // Get file info from Cloudinary
    async getFileInfo(publicId) {
        try {
            return await cloudinary_1.v2.api.resource(publicId);
        }
        catch (error) {
            throw new Error(`Failed to get file info: ${error}`);
        }
    }
    // Generate signed URL for secure access
    generateSignedUrl(publicId, options = {}) {
        const timestamp = Math.round(new Date().getTime() / 1000) + 3600; // 1 hour expiry
        return cloudinary_1.v2.utils.private_download_url(publicId, 'pdf', {
            ...options,
            expires_at: timestamp,
        });
    }
    // Validate file type and size
    validateFile(file, options = {}) {
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
    getFileCategory(mimetype) {
        if (mimetype.startsWith('image/')) {
            return 'image';
        }
        else if (mimetype === 'application/pdf' ||
            mimetype === 'application/msword' ||
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'document';
        }
        else if (mimetype === 'application/vnd.ms-excel' ||
            mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return 'spreadsheet';
        }
        else {
            return 'other';
        }
    }
    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    // Test Cloudinary connection
    async testConnection() {
        try {
            await cloudinary_1.v2.api.ping();
            console.log('Cloudinary connection verified');
            return true;
        }
        catch (error) {
            console.error('Cloudinary connection failed:', error);
            return false;
        }
    }
}
exports.fileUploadService = new FileUploadService();
exports.default = exports.fileUploadService;
//# sourceMappingURL=fileUploadService.js.map
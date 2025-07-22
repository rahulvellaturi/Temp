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
declare class FileUploadService {
    private getMulterConfig;
    single(fieldName: string, options?: FileUploadOptions): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    multiple(fieldName: string, maxCount?: number, options?: FileUploadOptions): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    uploadToCloudinary(file: Express.Multer.File, options?: FileUploadOptions): Promise<UploadResult>;
    uploadMultipleToCloudinary(files: Express.Multer.File[], options?: FileUploadOptions): Promise<UploadResult[]>;
    deleteFromCloudinary(publicId: string): Promise<boolean>;
    deleteMultipleFromCloudinary(publicIds: string[]): Promise<boolean>;
    getFileInfo(publicId: string): Promise<any>;
    generateSignedUrl(publicId: string, options?: any): string;
    validateFile(file: Express.Multer.File, options?: FileUploadOptions): {
        valid: boolean;
        error?: string;
    };
    getFileCategory(mimetype: string): 'image' | 'document' | 'spreadsheet' | 'other';
    formatFileSize(bytes: number): string;
    testConnection(): Promise<boolean>;
}
export declare const fileUploadService: FileUploadService;
export default fileUploadService;
//# sourceMappingURL=fileUploadService.d.ts.map
import React, { useRef, useState } from 'react';
import { Control, FieldValues, Path } from 'react-hook-form';
import { Upload, X, File, Image, FileText, AlertCircle } from 'lucide-react';
import FormField from './FormField';
import FormLabel from './FormLabel';
import FormError from './FormError';

export interface FormFileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  allowedTypes?: string[];
  variant?: 'default' | 'dropzone' | 'button';
  preview?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
}

const FormFileUpload = <T extends FieldValues>({
  name,
  control,
  label,
  disabled = false,
  required = false,
  className = '',
  helpText,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  allowedTypes = [],
  variant = 'dropzone',
  preview = true,
  ...props
}: FormFileUploadProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-neutral-500" />;
    }
  };

  const validateFile = (file: File) => {
    const errors: string[] = [];

    if (maxSize && file.size > maxSize) {
      errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    return errors;
  };

  return (
    <FormField
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const handleFiles = (fileList: FileList | null) => {
          if (!fileList) return;

          const newFiles = Array.from(fileList);
          const validFiles: FileWithPreview[] = [];
          const errors: string[] = [];

          newFiles.forEach(file => {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
              errors.push(`${file.name}: ${fileErrors.join(', ')}`);
            } else {
              const fileWithPreview = file as FileWithPreview;
              if (preview && file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
              }
              validFiles.push(fileWithPreview);
            }
          });

          if (multiple) {
            const totalFiles = [...files, ...validFiles];
            if (totalFiles.length > maxFiles) {
              errors.push(`Maximum ${maxFiles} files allowed`);
              return;
            }
            setFiles(totalFiles);
            field.onChange(totalFiles);
          } else {
            if (validFiles.length > 0) {
              setFiles([validFiles[0]]);
              field.onChange(validFiles[0]);
            }
          }

          if (errors.length > 0) {
            console.warn('File upload errors:', errors);
          }
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          
          if (!disabled) {
            handleFiles(e.dataTransfer.files);
          }
        };

        const handleDragOver = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setDragActive(true);
          }
        };

        const handleDragLeave = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          handleFiles(e.target.files);
        };

        const removeFile = (index: number) => {
          const newFiles = files.filter((_, i) => i !== index);
          setFiles(newFiles);
          
          if (multiple) {
            field.onChange(newFiles);
          } else {
            field.onChange(null);
          }

          // Revoke object URL to prevent memory leaks
          if (files[index].preview) {
            URL.revokeObjectURL(files[index].preview!);
          }
        };

        const openFileDialog = () => {
          if (!disabled && inputRef.current) {
            inputRef.current.click();
          }
        };

        const dropzoneClasses = [
          'relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200',
          'flex flex-col items-center justify-center text-center',
          'hover:border-primary hover:bg-primary/5',
          dragActive ? 'border-primary bg-primary/10' : 'border-neutral-300',
          fieldState.error ? 'border-red-300 bg-red-50' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          className,
        ].join(' ');

        const buttonClasses = [
          'inline-flex items-center px-4 py-2 border border-neutral-300',
          'rounded-lg text-sm font-medium transition-colors duration-200',
          'hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          fieldState.error ? 'border-red-300 text-red-700' : 'text-neutral-700',
        ].join(' ');

        return (
          <div className="space-y-2">
            {label && (
              <FormLabel required={required}>
                {label}
              </FormLabel>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled}
              {...props}
            />

            {variant === 'dropzone' ? (
              <div
                className={dropzoneClasses}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={openFileDialog}
              >
                <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-700">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
                  {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                </p>
              </div>
            ) : (
              <button
                type="button"
                className={buttonClasses}
                onClick={openFileDialog}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose {multiple ? 'Files' : 'File'}
              </button>
            )}

            {/* File Preview */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                  >
                    <div className="flex items-center space-x-3">
                      {preview && file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file)
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900 truncate max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {helpText && !fieldState.error && (
              <p className="text-sm text-neutral-600">{helpText}</p>
            )}

            <FormError name={name} />
          </div>
        );
      }}
    />
  );
};

export default FormFileUpload;
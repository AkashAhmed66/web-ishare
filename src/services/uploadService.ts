import apiService from './apiService';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface UploadApiResponse {
  message: string;
  data: UploadResponse;
}

// Upload a single file
export const uploadFile = async (file: File, folder: string = 'documents'): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiService.post<UploadApiResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Upload multiple files
export const uploadFiles = async (files: File[], folder: string = 'documents'): Promise<UploadResponse[]> => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload failed:', error);
    throw error;
  }
};

// Validate file before upload
export const validateFile = (file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload JPG, PNG, or PDF files.'
    };
  }

  return { valid: true };
};

export const uploadService = {
  uploadFile,
  uploadFiles,
  validateFile,
};

export default uploadService; 
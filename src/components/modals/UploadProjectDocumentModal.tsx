import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import Button from '../common/button/button';

import { selectCurrentUser } from '../../store/slices/auth_slice';
import { projectsService } from '../../services/projects';

// Validation schema for project documents
const uploadProjectDocumentSchema = z.object({
  type: z.enum(['tz', 'contract'], {
    required_error: 'Выберите тип документа'
  }),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Выберите файл для загрузки')
    .refine(
      (file) => file.size <= 100 * 1024 * 1024, // 100MB
      'Размер файла не должен превышать 100 МБ'
    )
    .refine(
      (file) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/webp',
          'image/svg+xml'
        ];
        return allowedTypes.includes(file.type);
      },
      'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, BMP, WebP, SVG'
    )
});

type UploadProjectDocumentFormData = z.infer<typeof uploadProjectDocumentSchema>;

interface UploadProjectDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  documentType: 'tz' | 'contract';
  onUploadSuccess: () => void;
}

function UploadProjectDocumentModal({
  isOpen,
  onClose,
  projectId,
  documentType,
  onUploadSuccess
}: UploadProjectDocumentModalProps): JSX.Element {
  // Redux state
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors
  } = useForm<UploadProjectDocumentFormData>({
    resolver: zodResolver(uploadProjectDocumentSchema),
    defaultValues: {
      type: documentType
    }
  });

  // Set form defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue('type', documentType);
    }
  }, [isOpen, documentType, setValue]);

  // Validate file function
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > 100 * 1024 * 1024) {
      return 'Размер файла не должен превышать 100 МБ';
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml'
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, BMP, WebP, SVG';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelection = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setFileValidationError(validationError);
      setSelectedFile(null);
      return;
    }

    setFileValidationError(null);
    setSelectedFile(file);
    setValue('file', file);
    clearErrors('file');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    } else {
      setSelectedFile(null);
      setFileValidationError(null);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const onSubmit = async (data: UploadProjectDocumentFormData) => {
    if (isSubmitting || !selectedFile) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      await projectsService.uploadProjectDocument({
        file: selectedFile,
        type: data.type,
        projectId: projectId
      }, (progress) => {
        setUploadProgress(progress);
      });

      toast.success(`${documentType === 'tz' ? 'ТЗ' : 'Договор'} успешно загружен`);
      onUploadSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error uploading project document:', error);
      toast.error(error || `Ошибка при загрузке ${documentType === 'tz' ? 'ТЗ' : 'договора'}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    reset();
    setSelectedFile(null);
    setFileValidationError(null);
    setIsDragOver(false);
    setUploadProgress(0);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    return projectsService.formatFileSize(bytes);
  };

  // Get document type display name
  const getDocumentTypeName = (type: 'tz' | 'contract'): string => {
    return type === 'tz' ? 'Техническое задание (ТЗ)' : 'Договор';
  };

  // Check permissions
  const canUploadDocuments = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (!canUploadDocuments) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <Modal.Header onClose={handleClose}>
          Доступ запрещен
        </Modal.Header>
        <Modal.Content>
          <div className="modal-access-denied">
            <p>У вас нет прав для загрузки документов проекта.</p>
            <div className="modal-actions">
              <Button onClick={handleClose}>Закрыть</Button>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="modal--medium"
    >
      <Modal.Header onClose={handleClose}>
        Загрузить {getDocumentTypeName(documentType)}
      </Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit as any)} className="modal-form">
          {/* Document Type - Display only */}
          <FormGroup>
            <label className="form-label">
              Тип документа
            </label>
            <div className="form-display-value">
              {projectsService.getProjectDocumentTypeLabel(documentType)}
            </div>
          </FormGroup>

          {/* File Upload with Drag & Drop */}
          <FormGroup>
            <label htmlFor="documentFile" className="form-label">
              Файл документа <span className="required">*</span>
            </label>
            <div className="file-upload">
              <input
                ref={fileInputRef}
                id="documentFile"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                onChange={handleFileChange}
                className="file-upload__input"
                style={{ display: 'none' }}
              />
              <div
                className={`file-upload__dropzone ${
                  isDragOver ? 'file-upload__dropzone--drag-over' : ''
                } ${
                  selectedFile ? 'file-upload__dropzone--has-file' : ''
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={!selectedFile ? handleFileInputClick : undefined}
              >
                {selectedFile ? (
                  <div className="file-upload__selected">
                    <div className="file-info">
                      <div className="file-info__icon">
                        {selectedFile.type.startsWith('image/') ? '🖼️' :
                         selectedFile.type.includes('pdf') ? '📄' :
                         selectedFile.type.includes('word') ? '📝' :
                         selectedFile.type.includes('excel') || selectedFile.type.includes('sheet') ? '📊' : '📎'}
                      </div>
                      <div className="file-info__details">
                        <div className="file-info__name">{selectedFile.name}</div>
                        <div className="file-info__size">{formatFileSize(selectedFile.size)}</div>
                        <div className="file-info__type">{selectedFile.type}</div>
                      </div>
                    </div>
                    <div className="file-upload__actions">
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileInputClick();
                        }}
                      >
                        Заменить
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFileValidationError(null);
                          setValue('file', null as any);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="file-upload__placeholder">
                    <div className="file-upload__icon">
                      {isDragOver ? '⬇️' : '📁'}
                    </div>
                    <div className="file-upload__text">
                      <div className="file-upload__primary">
                        {isDragOver ? 'Отпустите файл для загрузки' : 'Перетащите файл сюда или нажмите для выбора'}
                      </div>
                      <div className="file-upload__secondary">
                        Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, BMP, WebP, SVG
                      </div>
                      <div className="file-upload__size-limit">
                        Максимальный размер: 100 МБ
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {(errors.file || fileValidationError) && (
              <span className="form-error">{errors.file?.message || fileValidationError}</span>
            )}
          </FormGroup>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="upload-progress">
              <div className="upload-progress__label">
                Загрузка файла: {uploadProgress}%
              </div>
              <div className="upload-progress__bar">
                <div
                  className="upload-progress__fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? 'Загрузка...' : `Загрузить ${documentType === 'tz' ? 'ТЗ' : 'договор'}`}
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  );
}

export default UploadProjectDocumentModal;
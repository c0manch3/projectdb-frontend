import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormSelect from '../forms/form_select/form_select';
import Button from '../common/button/button';
import { constructionsService } from '../../services/constructions';
import type { Construction, ConstructionDocumentType } from '../../store/types';

// Validation schema
const uploadVersionedDocumentSchema = z.object({
  type: z.enum(['working_documentation', 'project_documentation'], {
    required_error: 'Выберите категорию документа',
  }),
  version: z.number().min(1, 'Версия должна быть не меньше 1'),
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
          'image/dwg',
          'application/dwg',
          'application/autocad',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/bmp',
          'image/webp',
          'image/svg+xml',
        ];
        return allowedTypes.includes(file.type);
      },
      'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP, SVG'
    ),
});

type UploadVersionedDocumentFormData = z.infer<typeof uploadVersionedDocumentSchema>;

interface UploadVersionedDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  construction: Construction;
  preselectedVersion?: number;
  preselectedCategory?: ConstructionDocumentType;
  onSuccess: () => void;
}

function UploadVersionedDocumentModal({
  isOpen,
  onClose,
  construction,
  preselectedVersion = 1,
  preselectedCategory,
  onSuccess,
}: UploadVersionedDocumentModalProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<UploadVersionedDocumentFormData>({
    resolver: zodResolver(uploadVersionedDocumentSchema),
    defaultValues: {
      version: preselectedVersion,
      type: preselectedCategory,
    },
  });

  const selectedType = watch('type');

  // Validate file function
  const validateFile = (file: File): string | null => {
    if (file.size > 100 * 1024 * 1024) {
      return 'Размер файла не должен превышать 100 МБ';
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/dwg',
      'application/dwg',
      'application/autocad',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP, SVG';
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

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle form submission
  const onSubmit = async (data: UploadVersionedDocumentFormData) => {
    if (isSubmitting || !selectedFile) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      await constructionsService.uploadDocument(
        {
          file: selectedFile,
          type: data.type,
          constructionId: construction.id,
          version: data.version,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      toast.success(`Документ успешно загружен в версию v${data.version}`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(
        typeof error === 'string' ? error : error?.message || 'Ошибка при загрузке документа'
      );
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="modal--medium">
      <Modal.Header onClose={handleClose}>Загрузить документ</Modal.Header>
      <Modal.Content>
        <form onSubmit={handleSubmit(onSubmit as any)} className="modal-form">
          <div className="form-info">
            <p className="form-info__text">
              Сооружение: <strong>{construction.name}</strong>
            </p>
          </div>

          {/* Version Selection */}
          <FormGroup>
            <label htmlFor="documentVersion" className="form-label">
              Версия <span className="required">*</span>
            </label>
            <FormSelect id="documentVersion" {...register('version', { valueAsNumber: true })}>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Версия {i + 1}
                </option>
              ))}
            </FormSelect>
            {errors.version && <span className="form-error">{errors.version.message}</span>}
            <div className="form-help">
              Выберите версию для загрузки документа. Если версия не существует, она будет создана
              автоматически.
            </div>
          </FormGroup>

          {/* Document Category */}
          <FormGroup>
            <label htmlFor="documentType" className="form-label">
              Категория документа <span className="required">*</span>
            </label>
            <FormSelect id="documentType" {...register('type')}>
              <option value="">Выберите категорию</option>
              <option value="working_documentation">Рабочая документация</option>
              <option value="project_documentation">Проектная документация</option>
            </FormSelect>
            {errors.type && <span className="form-error">{errors.type.message}</span>}
            <div className="form-help">
              <div className="document-category-info">
                <div className="document-category-info__item">
                  <strong>Рабочая документация:</strong> Чертежи КМ, КЖ, схемы, расчёты
                </div>
                <div className="document-category-info__item">
                  <strong>Проектная документация:</strong> ГП, РПЗ, ИГИ, СПОЗУ
                </div>
              </div>
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                onChange={handleFileChange}
                className="file-upload__input"
                style={{ display: 'none' }}
              />
              <div
                className={`file-upload__dropzone ${
                  isDragOver ? 'file-upload__dropzone--drag-over' : ''
                } ${selectedFile ? 'file-upload__dropzone--has-file' : ''}`}
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
                        {selectedFile.type.startsWith('image/')
                          ? '🖼️'
                          : selectedFile.type.includes('pdf')
                          ? '📄'
                          : selectedFile.type.includes('word')
                          ? '📝'
                          : selectedFile.type.includes('excel') || selectedFile.type.includes('sheet')
                          ? '📊'
                          : selectedFile.type.includes('dwg')
                          ? '📐'
                          : '📎'}
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
                    <div className="file-upload__icon">{isDragOver ? '⬇️' : '📁'}</div>
                    <div className="file-upload__text">
                      <div className="file-upload__primary">
                        {isDragOver
                          ? 'Отпустите файл для загрузки'
                          : 'Перетащите файл сюда или нажмите для выбора'}
                      </div>
                      <div className="file-upload__secondary">
                        Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP,
                        SVG
                      </div>
                      <div className="file-upload__size-limit">Максимальный размер: 100 МБ</div>
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
              <div className="upload-progress__label">Загрузка файла: {uploadProgress}%</div>
              <div className="upload-progress__bar">
                <div
                  className="upload-progress__fill"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          <div className="modal-actions">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFile || !selectedType}>
              {isSubmitting ? 'Загрузка...' : 'Загрузить документ'}
            </Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  );
}

export default UploadVersionedDocumentModal;

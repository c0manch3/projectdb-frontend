import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../common/modal/modal';
import FormGroup from '../forms/form_group/form_group';
import FormSelect from '../forms/form_select/form_select';
import Button from '../common/button/button';
import LoadingState from '../common/loading_state/loading_state';

import type { AppDispatch } from '../../store';
import {
  uploadDocument,
  selectDocumentsError,
  selectUploadProgress,
  resetUploadProgress,
  fetchConstructionsByProject
} from '../../store/slices/constructions_slice';
import {
  fetchProjects,
  selectProjectsList,
  selectProjectsLoading
} from '../../store/slices/projects_slice';
import { selectCurrentUser } from '../../store/slices/auth_slice';
import type { Construction, Document, DocumentType } from '../../store/types';
import { constructionsService } from '../../services/constructions';

// Validation schema for construction documents only
const uploadDocumentSchema = z.object({
  type: z.enum(['working_documentation', 'project_documentation'], {
    required_error: 'Выберите тип документа'
  }),
  constructionId: z.string().min(1, 'Выберите сооружение'),
  version: z.number().optional(),
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
          'image/svg+xml'
        ];
        return allowedTypes.includes(file.type);
      },
      'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP, SVG'
    )
});

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  construction: Construction | null; // Required construction for document upload
  existingDocuments?: Document[]; // Existing documents for selected construction
  initialVersion?: number; // Optional: specific version to upload to
  initialType?: 'working_documentation' | 'project_documentation'; // Optional: pre-select type
}

function UploadDocumentModal({
  isOpen,
  onClose,
  projectId,
  construction,
  existingDocuments = []
}: UploadDocumentModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const documentsError = useSelector(selectDocumentsError);
  const uploadProgress = useSelector(selectUploadProgress);
  const projects = useSelector(selectProjectsList);
  const projectsLoading = useSelector(selectProjectsLoading);
  const currentUser = useSelector(selectCurrentUser);

  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [constructions, setConstructions] = useState<Construction[]>([]);
  const [constructionsLoading, setConstructionsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const [constructionDocuments, setConstructionDocuments] = useState<Document[]>(existingDocuments);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      projectId: projectId || '',
      constructionId: construction?.id || ''
    }
  });

  // Watch form values
  const selectedProjectId = watch('projectId');
  const selectedConstructionId = watch('constructionId');

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen && projects.length === 0 && !projectsLoading) {
      // For managers, filter projects by their managerId
      // For admins, show all projects
      const isValidUUID = currentUser?.id && !currentUser.id.startsWith('temp-');
      const filterParams = currentUser?.role === 'Manager' && isValidUUID
        ? { managerId: currentUser.id }
        : undefined;
      dispatch(fetchProjects(filterParams));
    }
  }, [isOpen, projects.length, projectsLoading, dispatch, currentUser?.id, currentUser?.role]);

  // Set form defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      if (projectId) {
        setValue('projectId', projectId);
      }
      if (construction) {
        setValue('constructionId', construction.id);
      }
    }
  }, [isOpen, projectId, construction, setValue]);

  // Load constructions when project changes
  const loadConstructions = useCallback(async (selectedProjectId: string) => {
    if (!selectedProjectId) {
      setConstructions([]);
      return;
    }

    setConstructionsLoading(true);

    try {
      const result = await dispatch(fetchConstructionsByProject(selectedProjectId)).unwrap();
      setConstructions(result.constructions);
    } catch (error) {
      console.error('Error loading constructions:', error);
      setConstructions([]);
    } finally {
      setConstructionsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId && !construction) {
      loadConstructions(selectedProjectId);
    }
  }, [selectedProjectId, construction, loadConstructions]);

  // Load documents for selected construction
  const loadConstructionDocuments = useCallback(async (constructionId: string) => {
    try {
      const documents = await constructionsService.getDocumentsByConstruction(constructionId);
      setConstructionDocuments(documents);
    } catch (error) {
      console.error('Error loading construction documents:', error);
      setConstructionDocuments([]);
    }
  }, []);

  useEffect(() => {
    if (selectedConstructionId) {
      loadConstructionDocuments(selectedConstructionId);
    } else if (construction) {
      setConstructionDocuments(existingDocuments);
    } else {
      setConstructionDocuments([]);
    }
  }, [selectedConstructionId, construction, existingDocuments, loadConstructionDocuments]);

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
      'image/dwg',
      'application/dwg',
      'application/autocad',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
      'image/svg+xml'
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

  // Handle form submission
  const onSubmit = async (data: UploadDocumentFormData) => {
    if (isSubmitting || !selectedFile) return;

    setIsSubmitting(true);
    dispatch(resetUploadProgress());

    try {
      await dispatch(uploadDocument({
        file: selectedFile,
        type: data.type,
        projectId: data.projectId,
        constructionId: data.constructionId
      })).unwrap();

      toast.success('Документ успешно загружен');
      onClose();
      reset();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      if (error?.includes('already exists')) {
        toast.error('Документ данного типа уже существует для этой конструкции');
      } else if (error?.includes('cannot have type')) {
        toast.error('Данный тип документа недоступен для конструкций');
      } else {
        toast.error(typeof error === 'string' ? error : error?.message || 'Ошибка при загрузке документа');
      }
    } finally {
      setIsSubmitting(false);
      dispatch(resetUploadProgress());
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
    setConstructionDocuments(existingDocuments);
    dispatch(resetUploadProgress());
  };

  // Get available document types based on construction selection and existing documents
  const getAvailableDocumentTypes = (): Array<{value: string, label: string, disabled: boolean, reason?: string}> => {
    const allTypes = [
      { value: 'km', label: 'КМ - Конструкции металлические' },
      { value: 'kz', label: 'КЖ - Конструкции железобетонные' },
      { value: 'rpz', label: 'РПЗ - Расчетно-пояснительная записка' },
      { value: 'tz', label: 'ТЗ - Техническое задание' },
      { value: 'gp', label: 'ГП - Генеральный план' },
      { value: 'igi', label: 'ИГИ - Инженерно-геологические изыскания' },
      { value: 'spozu', label: 'СПОЗУ - Специальные противопожарные мероприятия' },
      { value: 'contract', label: 'Договор - Договорная документация' }
    ];

    // If construction is selected, apply restrictions
    if (selectedConstructionId || construction) {
      const restrictedTypesForConstruction = ['contract', 'tz'];
      const usedTypes = constructionDocuments.map(doc => doc.type);

      return allTypes.map(type => {
        if (restrictedTypesForConstruction.includes(type.value)) {
          return {
            ...type,
            disabled: true,
            reason: 'Недоступно для конструкций'
          };
        }
        if (usedTypes.includes(type.value as DocumentType)) {
          return {
            ...type,
            disabled: true,
            reason: 'Уже добавлен'
          };
        }
        return { ...type, disabled: false };
      });
    }

    return allTypes.map(type => ({ ...type, disabled: false }));
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <p>У вас нет прав для загрузки документов.</p>
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
        Загрузить документ
      </Modal.Header>
      <Modal.Content>
        {projectsLoading && (
          <LoadingState message="Загрузка списка проектов..." />
        )}

        {!projectsLoading && (
          <form onSubmit={handleSubmit(onSubmit as any)} className="modal-form">
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
                           selectedFile.type.includes('excel') || selectedFile.type.includes('sheet') ? '📊' :
                           selectedFile.type.includes('dwg') ? '📐' : '📎'}
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
                          Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG, JPG, PNG, GIF, BMP, WebP, SVG
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

            {/* Document Type */}
            <FormGroup>
              <label htmlFor="documentType" className="form-label">
                Тип документа <span className="required">*</span>
              </label>
              <FormSelect
                id="documentType"
                {...register('type')}
              >
                <option value="">Выберите тип документа</option>
                {getAvailableDocumentTypes().map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                    disabled={type.disabled}
                    title={type.reason}
                  >
                    {type.label} {type.disabled ? `(${type.reason})` : ''}
                  </option>
                ))}
              </FormSelect>
              {errors.type && (
                <span className="form-error">{errors.type.message}</span>
              )}
              {(selectedConstructionId || construction) && (
                <div className="form-help">
                  <div className="document-type-info">
                    <div className="document-type-info__title">Информация о типах документов:</div>
                    <div className="document-type-info__restrictions">
                      • Для конструкций недоступны: ТЗ, Договор
                    </div>
                    {constructionDocuments.length > 0 && (
                      <div className="document-type-info__used">
                        • Уже добавлены: {constructionDocuments.map(doc => constructionsService.getDocumentTypeLabel(doc.type)).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FormGroup>


            {/* Project Selection */}
            <FormGroup>
              <label htmlFor="projectSelect" className="form-label">
                Проект <span className="required">*</span>
              </label>
              <FormSelect
                id="projectSelect"
                disabled={!!projectId || projects.length === 0}
                {...register('projectId')}
              >
                <option value="">Выберите проект</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </FormSelect>
              {errors.projectId && (
                <span className="form-error">{errors.projectId.message}</span>
              )}
            </FormGroup>

            {/* Construction Selection */}
            {selectedProjectId && (
              <FormGroup>
                <label htmlFor="constructionSelect" className="form-label">
                  Сооружение (необязательно)
                </label>
                {constructionsLoading ? (
                  <LoadingState message="Загрузка сооружений..." />
                ) : (
                  <FormSelect
                    id="constructionSelect"
                    disabled={!!construction || constructions.length === 0}
                    {...register('constructionId')}
                  >
                    <option value="">Без привязки к сооружению</option>
                    {constructions.map((constr) => (
                      <option key={constr.id} value={constr.id}>
                        {constr.name}
                      </option>
                    ))}
                  </FormSelect>
                )}
                {constructions.length === 0 && !constructionsLoading && (
                  <div className="form-help">
                    В выбранном проекте нет сооружений
                  </div>
                )}
                {construction && (
                  <div className="form-help">
                    Документ будет загружен для сооружения "{construction.name}"
                  </div>
                )}
              </FormGroup>
            )}

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

            {projects.length === 0 && !projectsLoading && (
              <div className="form-notice">
                <p>Нет доступных проектов для загрузки документов.</p>
              </div>
            )}

            {documentsError && (
              <div className="form-error-message">
                <p>{documentsError}</p>
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
                disabled={isSubmitting || projects.length === 0 || !selectedProjectId || !selectedFile}
              >
                {isSubmitting ? 'Загрузка...' : 'Загрузить документ'}
              </Button>
            </div>
          </form>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default UploadDocumentModal;
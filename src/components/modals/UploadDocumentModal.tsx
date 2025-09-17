import React, { useState, useEffect, useCallback } from 'react';
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
  selectDocumentsLoading,
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
import type { Construction } from '../../store/types';

// Validation schema
const uploadDocumentSchema = z.object({
  type: z.enum(['km', 'kz', 'rpz', 'tz', 'gp', 'igi', 'spozu', 'contract'], {
    required_error: 'Выберите тип документа'
  }),
  context: z.enum(['initial_data', 'project_doc'], {
    required_error: 'Выберите контекст документа'
  }),
  projectId: z.string().min(1, 'Выберите проект'),
  constructionId: z.string().optional(),
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
          'application/autocad'
        ];
        return allowedTypes.includes(file.type);
      },
      'Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, XLS, XLSX, DWG'
    )
});

type UploadDocumentFormData = z.infer<typeof uploadDocumentSchema>;

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // If provided, pre-select and disable project selection
  construction?: Construction | null; // If provided, pre-select construction
}

function UploadDocumentModal({
  isOpen,
  onClose,
  projectId,
  construction
}: UploadDocumentModalProps): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const documentsLoading = useSelector(selectDocumentsLoading);
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

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors
  } = useForm<UploadDocumentFormData>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      type: undefined,
      context: undefined,
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
      dispatch(fetchProjects());
    }
  }, [isOpen, projects.length, projectsLoading, dispatch]);

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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue('file', file);
      clearErrors('file');
    } else {
      setSelectedFile(null);
    }
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
        context: data.context,
        projectId: data.projectId,
        constructionId: data.constructionId || undefined
      })).unwrap();

      toast.success('Документ успешно загружен');
      onClose();
      reset();
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error || 'Ошибка при загрузке документа');
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
    dispatch(resetUploadProgress());
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
      <Modal isOpen={isOpen} onClose={handleClose} title="Доступ запрещен">
        <div className="modal-access-denied">
          <p>У вас нет прав для загрузки документов.</p>
          <div className="modal-actions">
            <Button onClick={handleClose}>Закрыть</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Загрузить документ"
      size="medium"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
        {projectsLoading && (
          <LoadingState message="Загрузка списка проектов..." />
        )}

        {!projectsLoading && (
          <>
            {/* File Upload */}
            <FormGroup>
              <label htmlFor="documentFile" className="form-label">
                Файл документа <span className="required">*</span>
              </label>
              <div className="file-upload">
                <input
                  id="documentFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg"
                  onChange={handleFileChange}
                  className="file-upload__input"
                />
                <div className="file-upload__display">
                  {selectedFile ? (
                    <div className="file-upload__selected">
                      <div className="file-info">
                        <div className="file-info__name">{selectedFile.name}</div>
                        <div className="file-info__size">{formatFileSize(selectedFile.size)}</div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={() => {
                          setSelectedFile(null);
                          setValue('file', null as any);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <div className="file-upload__placeholder">
                      Выберите файл для загрузки
                    </div>
                  )}
                </div>
              </div>
              {errors.file && (
                <span className="form-error">{errors.file.message}</span>
              )}
            </FormGroup>

            {/* Document Type */}
            <FormGroup>
              <label htmlFor="documentType" className="form-label">
                Тип документа <span className="required">*</span>
              </label>
              <FormSelect
                id="documentType"
                error={errors.type?.message}
                {...register('type')}
              >
                <option value="">Выберите тип документа</option>
                <option value="km">КМ</option>
                <option value="kz">КЖ</option>
                <option value="rpz">РПЗ</option>
                <option value="tz">ТЗ</option>
                <option value="gp">ГП</option>
                <option value="igi">ИГИ</option>
                <option value="spozu">СПОЗУ</option>
                <option value="contract">Договор</option>
              </FormSelect>
              {errors.type && (
                <span className="form-error">{errors.type.message}</span>
              )}
            </FormGroup>

            {/* Document Context */}
            <FormGroup>
              <label htmlFor="documentContext" className="form-label">
                Контекст документа <span className="required">*</span>
              </label>
              <FormSelect
                id="documentContext"
                error={errors.context?.message}
                {...register('context')}
              >
                <option value="">Выберите контекст</option>
                <option value="initial_data">Исходные данные</option>
                <option value="project_doc">Проектная документация</option>
              </FormSelect>
              {errors.context && (
                <span className="form-error">{errors.context.message}</span>
              )}
            </FormGroup>

            {/* Project Selection */}
            <FormGroup>
              <label htmlFor="projectSelect" className="form-label">
                Проект <span className="required">*</span>
              </label>
              <FormSelect
                id="projectSelect"
                error={errors.projectId?.message}
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
          </>
        )}
      </form>
    </Modal>
  );
}

export default UploadDocumentModal;
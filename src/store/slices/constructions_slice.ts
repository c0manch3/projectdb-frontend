import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ConstructionsState, Construction, Document } from '../types';
import {
  constructionsService,
  CreateConstructionDto,
  UpdateConstructionDto,
  ConstructionsFilters,
  UploadDocumentDto,
  DocumentsFilters,
  ConstructionStatsResponse
} from '../../services/constructions';

// Extended ConstructionsState with additional fields
interface ExtendedConstructionsState extends ConstructionsState {
  documents: Document[];
  documentsByConstruction: { [constructionId: string]: Document[] };
  uploadProgress: number;
  documentsLoading: boolean;
  documentsError: string | null;
  stats: { [constructionId: string]: ConstructionStatsResponse };
  statsLoading: boolean;
  searchQuery: string;
  filters: {
    projectId: string | null;
    documentType: 'km' | 'kz' | 'rpz' | 'tz' | 'gp' | 'igi' | 'spozu' | 'contract' | null;
    documentContext: 'initial_data' | 'project_doc' | null;
  };
}

// Initial state
const initialState: ExtendedConstructionsState = {
  list: [],
  byProject: {},
  current: null,
  loading: false,
  error: null,
  documents: [],
  documentsByConstruction: {},
  uploadProgress: 0,
  documentsLoading: false,
  documentsError: null,
  stats: {},
  statsLoading: false,
  searchQuery: '',
  filters: {
    projectId: null,
    documentType: null,
    documentContext: null,
  },
};

// Async thunks for construction operations

// Fetch all constructions with optional filters
export const fetchConstructions = createAsyncThunk(
  'constructions/fetchConstructions',
  async (filters: ConstructionsFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const constructions = await constructionsService.getConstructions(filters);
      return constructions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке сооружений');
    }
  }
);

// Fetch constructions by project ID
export const fetchConstructionsByProject = createAsyncThunk(
  'constructions/fetchConstructionsByProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const constructions = await constructionsService.getConstructionsByProject(projectId);
      return { projectId, constructions };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке сооружений проекта');
    }
  }
);

// Fetch construction by ID
export const fetchConstructionById = createAsyncThunk(
  'constructions/fetchConstructionById',
  async (id: string, { rejectWithValue }) => {
    try {
      const construction = await constructionsService.getConstructionById(id);
      return construction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке данных сооружения');
    }
  }
);

// Create new construction
export const createConstruction = createAsyncThunk(
  'constructions/createConstruction',
  async (constructionData: CreateConstructionDto, { rejectWithValue }) => {
    try {
      const newConstruction = await constructionsService.createConstruction(constructionData);
      return newConstruction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании сооружения');
    }
  }
);

// Update construction
export const updateConstruction = createAsyncThunk(
  'constructions/updateConstruction',
  async ({ id, data }: { id: string; data: UpdateConstructionDto }, { rejectWithValue }) => {
    try {
      const updatedConstruction = await constructionsService.updateConstruction(id, data);
      return updatedConstruction;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении данных сооружения');
    }
  }
);

// Delete construction
export const deleteConstruction = createAsyncThunk(
  'constructions/deleteConstruction',
  async (id: string, { rejectWithValue }) => {
    try {
      await constructionsService.deleteConstruction(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении сооружения');
    }
  }
);

// Fetch construction statistics
export const fetchConstructionStats = createAsyncThunk(
  'constructions/fetchConstructionStats',
  async (constructionId: string, { rejectWithValue }) => {
    try {
      const stats = await constructionsService.getConstructionStats(constructionId);
      return { constructionId, stats };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке статистики');
    }
  }
);

// Document operations

// Fetch documents with optional filters
export const fetchDocuments = createAsyncThunk(
  'constructions/fetchDocuments',
  async (filters: DocumentsFilters | undefined = undefined, { rejectWithValue }) => {
    try {
      const documents = await constructionsService.getDocuments(filters);
      return documents;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке документов');
    }
  }
);

// Fetch documents by construction ID
export const fetchDocumentsByConstruction = createAsyncThunk(
  'constructions/fetchDocumentsByConstruction',
  async (constructionId: string, { rejectWithValue }) => {
    try {
      const documents = await constructionsService.getDocumentsByConstruction(constructionId);
      return { constructionId, documents };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке документов сооружения');
    }
  }
);

// Upload document
export const uploadDocument = createAsyncThunk(
  'constructions/uploadDocument',
  async (uploadData: UploadDocumentDto, { rejectWithValue, dispatch }) => {
    try {
      const document = await constructionsService.uploadDocument(uploadData, (progress) => {
        dispatch(setUploadProgress(progress));
      });
      return document;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при загрузке документа');
    }
  }
);

// Download document
export const downloadDocument = createAsyncThunk(
  'constructions/downloadDocument',
  async ({ documentId, fileName }: { documentId: string; fileName: string }, { rejectWithValue }) => {
    try {
      const blob = await constructionsService.downloadDocument(documentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { documentId, success: true };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при скачивании документа');
    }
  }
);

// Delete document
export const deleteDocument = createAsyncThunk(
  'constructions/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      await constructionsService.deleteDocument(documentId);
      return documentId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при удалении документа');
    }
  }
);

// Constructions slice
const constructionsSlice = createSlice({
  name: 'constructions',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Set documents loading state
    setDocumentsLoading: (state, action: PayloadAction<boolean>) => {
      state.documentsLoading = action.payload;
      if (action.payload) {
        state.documentsError = null;
      }
    },

    // Set documents error state
    setDocumentsError: (state, action: PayloadAction<string | null>) => {
      state.documentsError = action.payload;
      state.documentsLoading = false;
    },

    // Set upload progress
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },

    // Reset upload progress
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },

    // Set constructions list
    setConstructions: (state, action: PayloadAction<Construction[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add new construction
    addConstruction: (state, action: PayloadAction<Construction>) => {
      state.list.unshift(action.payload);

      // Add to project-specific list if exists
      const projectId = action.payload.projectId;
      if (state.byProject[projectId]) {
        state.byProject[projectId].unshift(action.payload);
      } else {
        state.byProject[projectId] = [action.payload];
      }
    },

    // Update construction
    updateConstructionAction: (state, action: PayloadAction<Construction>) => {
      const index = state.list.findIndex(construction => construction.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }

      // Update in project-specific list
      const projectId = action.payload.projectId;
      if (state.byProject[projectId]) {
        const projectIndex = state.byProject[projectId].findIndex(c => c.id === action.payload.id);
        if (projectIndex !== -1) {
          state.byProject[projectId][projectIndex] = action.payload;
        }
      }

      if (state.current && state.current.id === action.payload.id) {
        state.current = action.payload;
      }
    },

    // Remove construction
    removeConstruction: (state, action: PayloadAction<string>) => {
      const constructionToRemove = state.list.find(c => c.id === action.payload);

      state.list = state.list.filter(construction => construction.id !== action.payload);

      // Remove from project-specific list
      if (constructionToRemove) {
        const projectId = constructionToRemove.projectId;
        if (state.byProject[projectId]) {
          state.byProject[projectId] = state.byProject[projectId].filter(c => c.id !== action.payload);
        }
      }

      if (state.current && state.current.id === action.payload) {
        state.current = null;
      }

      // Remove associated documents
      delete state.documentsByConstruction[action.payload];
      delete state.stats[action.payload];
    },

    // Set current construction
    setCurrentConstruction: (state, action: PayloadAction<Construction | null>) => {
      state.current = action.payload;
    },

    // Set documents
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
      state.documentsLoading = false;
      state.documentsError = null;
    },

    // Add document
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.unshift(action.payload);

      // Add to construction-specific list if construction ID exists
      if (action.payload.constructionId) {
        const constructionId = action.payload.constructionId;
        if (state.documentsByConstruction[constructionId]) {
          state.documentsByConstruction[constructionId].unshift(action.payload);
        } else {
          state.documentsByConstruction[constructionId] = [action.payload];
        }
      }
    },

    // Remove document
    removeDocument: (state, action: PayloadAction<string>) => {
      const documentToRemove = state.documents.find(d => d.id === action.payload);

      state.documents = state.documents.filter(document => document.id !== action.payload);

      // Remove from construction-specific list
      if (documentToRemove?.constructionId) {
        const constructionId = documentToRemove.constructionId;
        if (state.documentsByConstruction[constructionId]) {
          state.documentsByConstruction[constructionId] =
            state.documentsByConstruction[constructionId].filter(d => d.id !== action.payload);
        }
      }
    },

    // Update search query
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
      state.documentsError = null;
    },

    // Reset constructions state
    resetConstructionsState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch constructions
    builder
      .addCase(fetchConstructions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConstructions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchConstructions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch constructions by project
      .addCase(fetchConstructionsByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConstructionsByProject.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, constructions } = action.payload;
        state.byProject[projectId] = constructions;

        // Update main list if it includes constructions for this project
        constructions.forEach(construction => {
          const existingIndex = state.list.findIndex(c => c.id === construction.id);
          if (existingIndex !== -1) {
            state.list[existingIndex] = construction;
          } else {
            state.list.push(construction);
          }
        });
      })
      .addCase(fetchConstructionsByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch construction by ID
      .addCase(fetchConstructionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConstructionById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchConstructionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Create construction
      .addCase(createConstruction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConstruction.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);

        const projectId = action.payload.projectId;
        if (state.byProject[projectId]) {
          state.byProject[projectId].unshift(action.payload);
        } else {
          state.byProject[projectId] = [action.payload];
        }
      })
      .addCase(createConstruction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update construction
      .addCase(updateConstruction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConstruction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(construction => construction.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }

        const projectId = action.payload.projectId;
        if (state.byProject[projectId]) {
          const projectIndex = state.byProject[projectId].findIndex(c => c.id === action.payload.id);
          if (projectIndex !== -1) {
            state.byProject[projectId][projectIndex] = action.payload;
          }
        }

        if (state.current && state.current.id === action.payload.id) {
          state.current = action.payload;
        }
      })
      .addCase(updateConstruction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Delete construction
      .addCase(deleteConstruction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConstruction.fulfilled, (state, action) => {
        state.loading = false;
        const constructionToRemove = state.list.find(c => c.id === action.payload);

        state.list = state.list.filter(construction => construction.id !== action.payload);

        if (constructionToRemove) {
          const projectId = constructionToRemove.projectId;
          if (state.byProject[projectId]) {
            state.byProject[projectId] = state.byProject[projectId].filter(c => c.id !== action.payload);
          }
        }

        if (state.current && state.current.id === action.payload) {
          state.current = null;
        }

        delete state.documentsByConstruction[action.payload];
        delete state.stats[action.payload];
      })
      .addCase(deleteConstruction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch construction stats
      .addCase(fetchConstructionStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchConstructionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        const { constructionId, stats } = action.payload;
        state.stats[constructionId] = stats;
      })
      .addCase(fetchConstructionStats.rejected, (state) => {
        state.statsLoading = false;
      })

    // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload as string;
      })

    // Fetch documents by construction
      .addCase(fetchDocumentsByConstruction.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(fetchDocumentsByConstruction.fulfilled, (state, action) => {
        state.documentsLoading = false;
        const { constructionId, documents } = action.payload;
        state.documentsByConstruction[constructionId] = documents;

        // Update main documents list
        documents.forEach(document => {
          const existingIndex = state.documents.findIndex(d => d.id === document.id);
          if (existingIndex !== -1) {
            state.documents[existingIndex] = document;
          } else {
            state.documents.push(document);
          }
        });
      })
      .addCase(fetchDocumentsByConstruction.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload as string;
      })

    // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.uploadProgress = 100;
        state.documents.unshift(action.payload);

        if (action.payload.constructionId) {
          const constructionId = action.payload.constructionId;
          if (state.documentsByConstruction[constructionId]) {
            state.documentsByConstruction[constructionId].unshift(action.payload);
          } else {
            state.documentsByConstruction[constructionId] = [action.payload];
          }
        }
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload as string;
        state.uploadProgress = 0;
      })

    // Download document
      .addCase(downloadDocument.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(downloadDocument.fulfilled, (state) => {
        state.documentsLoading = false;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload as string;
      })

    // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.documentsLoading = true;
        state.documentsError = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documentsLoading = false;
        const documentToRemove = state.documents.find(d => d.id === action.payload);

        state.documents = state.documents.filter(document => document.id !== action.payload);

        if (documentToRemove?.constructionId) {
          const constructionId = documentToRemove.constructionId;
          if (state.documentsByConstruction[constructionId]) {
            state.documentsByConstruction[constructionId] =
              state.documentsByConstruction[constructionId].filter(d => d.id !== action.payload);
          }
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.documentsLoading = false;
        state.documentsError = action.payload as string;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  setDocumentsLoading,
  setDocumentsError,
  setUploadProgress,
  resetUploadProgress,
  setConstructions,
  addConstruction,
  updateConstructionAction,
  removeConstruction,
  setCurrentConstruction,
  setDocuments,
  addDocument,
  removeDocument,
  updateSearchQuery,
  updateFilters,
  resetFilters,
  clearError,
  resetConstructionsState,
} = constructionsSlice.actions;

// Export reducer
export default constructionsSlice.reducer;

// Selectors
export const selectConstructions = (state: { constructions: ExtendedConstructionsState }) => state.constructions;
export const selectConstructionsList = (state: { constructions: ExtendedConstructionsState }) => state.constructions.list;
export const selectCurrentConstruction = (state: { constructions: ExtendedConstructionsState }) => state.constructions.current;
export const selectConstructionsLoading = (state: { constructions: ExtendedConstructionsState }) => state.constructions.loading;
export const selectConstructionsError = (state: { constructions: ExtendedConstructionsState }) => state.constructions.error;
export const selectConstructionsByProject = (state: { constructions: ExtendedConstructionsState }) => state.constructions.byProject;
export const selectConstructionsFilters = (state: { constructions: ExtendedConstructionsState }) => state.constructions.filters;
export const selectConstructionSearchQuery = (state: { constructions: ExtendedConstructionsState }) => state.constructions.searchQuery;

// Document selectors
export const selectDocuments = (state: { constructions: ExtendedConstructionsState }) => state.constructions.documents;
export const selectDocumentsByConstruction = (state: { constructions: ExtendedConstructionsState }) => state.constructions.documentsByConstruction;
export const selectDocumentsLoading = (state: { constructions: ExtendedConstructionsState }) => state.constructions.documentsLoading;
export const selectDocumentsError = (state: { constructions: ExtendedConstructionsState }) => state.constructions.documentsError;
export const selectUploadProgress = (state: { constructions: ExtendedConstructionsState }) => state.constructions.uploadProgress;

// Stats selectors
export const selectConstructionStats = (state: { constructions: ExtendedConstructionsState }) => state.constructions.stats;
export const selectStatsLoading = (state: { constructions: ExtendedConstructionsState }) => state.constructions.statsLoading;

// Complex selectors
export const selectFilteredConstructions = (state: { constructions: ExtendedConstructionsState }) => {
  const { list, searchQuery, filters } = state.constructions;
  return list.filter(construction => {
    // Apply project filter
    if (filters.projectId && construction.projectId !== filters.projectId) return false;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = construction.name.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    return true;
  });
};

export const selectConstructionById = (state: { constructions: ExtendedConstructionsState }, constructionId: string) => {
  return state.constructions.list.find(construction => construction.id === constructionId) || null;
};

export const selectDocumentsByConstructionId = (state: { constructions: ExtendedConstructionsState }, constructionId: string) => {
  return state.constructions.documentsByConstruction[constructionId] || [];
};

export const selectFilteredDocuments = (state: { constructions: ExtendedConstructionsState }) => {
  const { documents, filters } = state.constructions;
  return documents.filter(document => {
    // Apply document type filter
    if (filters.documentType && document.type !== filters.documentType) return false;

    // Apply document context filter
    if (filters.documentContext && document.context !== filters.documentContext) return false;

    return true;
  });
};

export const selectConstructionStatsById = (state: { constructions: ExtendedConstructionsState }, constructionId: string) => {
  return state.constructions.stats[constructionId] || null;
};
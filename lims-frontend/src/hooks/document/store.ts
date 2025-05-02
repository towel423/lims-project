import { create } from 'zustand';
import { TypeDocumentsType } from '@/types/apps/typeDocumentTypes';
import { InternalDocumentsType } from '@/types/apps/internalDocumentTypes';
import { ExternalDocumentsType } from '@/types/apps/externalDocumentTypes';
import { DetailDocumentControlType, DocumentControlType, DocumentVersionType } from '@/types/apps/documentControlTypes';
import { FileMasterType } from '@/types/apps/documentTypes';

const useDocumentStore = create((set) => ({
    document: { 
        uuid: null,
        document_name: null,
        description: null,
        document_number: null,
        clause_number: null,
        revision_number: null, 
        publish_date: null,
        page_count: null,
        document_type_id: null,
        document_category_id: null,
        sequence_number: null,
        status_id: null,
        file: null 
    },

    // Modified `changeDocument` to return a Promise<void>
    changeDocument: (data: Partial<InternalDocumentsType | ExternalDocumentsType>): Promise<void> => {
        return new Promise<void>((resolve) => {
            set((state: any) => ({
                document: {
                    ...state.document,
                    ...data,
                },
            }));
            resolve();
        });
    },
}));


const useDetailDocumentControlStore = create<{
    documentControl: DocumentControlType;
    documentVersions: DocumentVersionType[];
    fileMaster: FileMasterType;
    changeDetailDocumentControl: (data: Partial<DetailDocumentControlType>) => Promise<void>;
}>((set, get) => ({
    documentControl: { 
        clause_number: null,
        created_at: null,
        created_by: null,
        deleted_at: null,
        description: null,
        document_category_id: null,
        document_category_name: null,
        document_category_prefix: null,
        document_name: null,
        document_number: null,
        document_type_id: null,
        document_type_name: null,
        document_type_prefix: null,
        id: null,
        page_count: null,
        publish_date: null,
        revision_number: null,
        sequence_number: null,
        status_document_id: null,
        status_document_name: null,
        updated_at: null,
        uuid: null,
    },
    documentVersions: [],
    fileMaster: {
        document_name: '',
        url_file: '',
        casbin_rule: {},
    },
    changeDetailDocumentControl: (data) => {
        return new Promise<void>((resolve) => {
            set((state) => ({
                documentControl: {
                    ...state.documentControl,
                    ...(data.documentControl || {}),
                },
                documentVersions: data.documentVersions ?? state.documentVersions,
                fileMaster: {
                    ...state.fileMaster,
                    ...(data.fileMaster || {}),
                },
            }));
            resolve();
        });
    },
}));

export { useDocumentStore, useDetailDocumentControlStore };

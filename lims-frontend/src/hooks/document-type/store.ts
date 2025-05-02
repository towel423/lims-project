import { create } from 'zustand';
import { TypeDocumentsType } from '@/types/apps/typeDocumentTypes';

const useDocumentTypeStore = create((set) => ({
    documentType: { uuid: null, name: null, prefix: null, document_category_id: null, role_has_rules: null },

    // Modified `changeDocumentType` to return a Promise<void>
    changeDocumentType: (data: Partial<TypeDocumentsType>): Promise<void> => {
        return new Promise<void>((resolve) => {
            set((state: any) => ({
                documentType: {
                    ...state.documentType,
                    ...data,
                },
            }));
            resolve();
        });
    },
}));

export { useDocumentTypeStore };

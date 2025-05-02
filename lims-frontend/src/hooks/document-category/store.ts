import { create } from 'zustand';
import { CategoryDocumentsType } from '@/types/apps/categoryDocumentTypes';

const useDocumentCategoryStore = create((set) => ({
    documentCategory: { uuid: null, name: null, prefix: null, role_has_rules: null },

    // Modified `changeDocumentCategory` to return a Promise<void>
    changeDocumentCategory: (data: Partial<CategoryDocumentsType>): Promise<void> => {
        return new Promise<void>((resolve) => {
            set((state: any) => ({
                documentCategory: {
                    ...state.documentCategory,
                    ...data,
                },
            }));
            resolve();
        });
    },
}));

export { useDocumentCategoryStore };

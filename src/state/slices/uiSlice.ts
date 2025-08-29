// src/state/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    isBottomSheetOpen: boolean;
    activeBottomSheet: string | null;
    isLoading: boolean;
    error: string | null;
    toast: {
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    } | null;
    modal: {
        type: string | null;
        data: any;
        visible: boolean;
    };
}

const initialState: UIState = {
    isBottomSheetOpen: false,
    activeBottomSheet: null,
    isLoading: false,
    error: null,
    toast: null,
    modal: {
        type: null,
        data: null,
        visible: false,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openBottomSheet: (state, action: PayloadAction<string>) => {
            state.isBottomSheetOpen = true;
            state.activeBottomSheet = action.payload;
        },
        closeBottomSheet: (state) => {
            state.isBottomSheetOpen = false;
            state.activeBottomSheet = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        showToast: (state, action: PayloadAction<{
            message: string;
            type: 'success' | 'error' | 'warning' | 'info';
        }>) => {
            state.toast = {
                ...action.payload,
                visible: true,
            };
        },
        hideToast: (state) => {
            if (state.toast) {
                state.toast.visible = false;
            }
        },
        clearToast: (state) => {
            state.toast = null;
        },
        openModal: (state, action: PayloadAction<{
            type: string;
            data?: any;
        }>) => {
            state.modal = {
                type: action.payload.type,
                data: action.payload.data || null,
                visible: true,
            };
        },
        closeModal: (state) => {
            state.modal = {
                type: null,
                data: null,
                visible: false,
            };
        },
    },
});

export const {
    openBottomSheet,
    closeBottomSheet,
    setLoading,
    setError,
    showToast,
    hideToast,
    clearToast,
    openModal,
    closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
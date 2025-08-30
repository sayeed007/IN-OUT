import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../../state/store';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface StoreProviderProps {
    children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate
                loading={<LoadingSpinner />}
                persistor={persistor}
            >
                {children}
            </PersistGate>
        </Provider>
    );
};
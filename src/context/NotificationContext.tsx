import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationVariant = 'success' | 'error' | 'info';
type ConfirmationVariant = 'danger' | 'warning' | 'info';

interface NotificationState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: NotificationVariant;
}

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: ConfirmationVariant;
  onConfirm: () => void;
}

interface NotificationContextValue {
  showNotification: (title: string, message: string, variant?: NotificationVariant) => void;
  showConfirmation: (title: string, message: string, onConfirm: () => void, variant?: ConfirmationVariant) => void;
  notification: NotificationState;
  confirmation: ConfirmationState;
  closeNotification: () => void;
  closeConfirmation: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    onConfirm: () => {},
  });

  const showNotification = useCallback((title: string, message: string, variant: NotificationVariant = 'info') => {
    setNotification({ isOpen: true, title, message, variant });
  }, []);

  const showConfirmation = useCallback(
    (title: string, message: string, onConfirm: () => void, variant: ConfirmationVariant = 'warning') => {
      setConfirmation({ isOpen: true, title, message, variant, onConfirm });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showConfirmation,
        notification,
        confirmation,
        closeNotification,
        closeConfirmation,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

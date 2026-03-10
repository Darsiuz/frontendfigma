import { createContext, useContext } from 'react';
import type { Product } from '@type/Product';
import type { Movement } from '@type/Movement';
import type { Incident } from '@type/Incident';
import type { SystemConfig } from '@type/SystemConfig';
import type { User } from '@type/User';

interface AppContextType {
  currentUser: User;
  products: Product[];
  movements: Movement[];
  incidents: Incident[];
  systemConfig: SystemConfig | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AppContextType;
}) => {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
};
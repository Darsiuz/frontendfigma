import { createContext, useContext } from 'react';
import type { Product } from '@/app/types/Product';
import type { Movement } from '@/app/types/Movement';
import type { Incident } from '@/app/types/Incident';
import type { SystemConfig } from '@/app/types/SystemConfig';
import { User } from '@/app/types/User';

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
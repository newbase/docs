import React, { createContext, useContext } from 'react';

export type LayoutWidth = 'default' | 'wide' | 'full';

export type LayoutWidthContextValue = {
  setLayoutWidth?: (width: LayoutWidth) => void;
};

const LayoutWidthContext = createContext<LayoutWidthContextValue | undefined>(undefined);

export function LayoutWidthProvider({
  value,
  children,
}: {
  value: LayoutWidthContextValue;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <LayoutWidthContext.Provider value={value}>
      {children}
    </LayoutWidthContext.Provider>
  );
}

export function useLayoutWidth(): LayoutWidthContextValue {
  const context = useContext(LayoutWidthContext);
  return context ?? {};
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { NewLeadModal } from "./NewLeadModal";

type NewLeadModalContextValue = {
  openNewLead: () => void;
};

const NewLeadModalContext = createContext<NewLeadModalContextValue | null>(null);

export function NewLeadModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openNewLead = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openNewLead }), [openNewLead]);

  return (
    <NewLeadModalContext.Provider value={value}>
      {children}
      <NewLeadModal open={open} onClose={close} />
    </NewLeadModalContext.Provider>
  );
}

export function useNewLeadModal(): NewLeadModalContextValue {
  const ctx = useContext(NewLeadModalContext);
  if (!ctx) {
    throw new Error("useNewLeadModal must be used within NewLeadModalProvider");
  }
  return ctx;
}

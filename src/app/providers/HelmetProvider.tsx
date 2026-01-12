import { HelmetProvider } from "react-helmet-async";

export const AppHelmetProvider = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

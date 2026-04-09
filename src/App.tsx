import { createContext, useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

export type Language = "lv" | "en" | "ru" | "uk";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
};

export const LanguageContext = createContext<LanguageContextType>({
  lang: "lv",
  setLang: () => {},
});

const queryClient = new QueryClient();

const App = () => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem("site-lang");
    if (savedLang === "lv" || savedLang === "en" || savedLang === "ru" || savedLang === "uk") {
      return savedLang;
    }
    return "lv";
  });

  useEffect(() => {
    localStorage.setItem("site-lang", lang);
  }, [lang]);

  const languageValue = useMemo(
    () => ({
      lang,
      setLang,
    }),
    [lang],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContext.Provider value={languageValue}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageContext.Provider>
    </QueryClientProvider>
  );
};

export default App;

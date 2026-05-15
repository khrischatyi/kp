import { Route, Routes } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Contacts from "@/pages/Contacts";
import Galleries from "@/pages/Galleries";
import Home from "@/pages/Home";
import Kitchens from "@/pages/Kitchens";

export default function App() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ScrollToTop />
      <Navbar />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kitchens" element={<Kitchens />} />
          <Route path="/galleries" element={<Galleries />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </PageTransition>
    </div>
  );
}

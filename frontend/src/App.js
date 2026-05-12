import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Counselors from "./pages/Counselors";
import Stories from "./pages/Stories";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Chat from "./pages/Chat";
import About from "./pages/About";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-[#F9F7F3] text-[#1F1A17]">
      <BrowserRouter>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/counselors" element={<Counselors />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;

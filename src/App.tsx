import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Toolsets from "./components/Toolset/Toolsets";
import InvisibleCharEditor from "./components/Toolset/InvisibleCharEditor/InvisibleCharEditor";
import DrUnicodeWrapper from "./components/Toolset/DrUnicode/DrUnicodeWrapper";
import CrashCharSequenceGenerator from "./components/Toolset/CrashCharSequenceGenerator/CrashCharSequenceGenerator";
import Footer from "./components/Footer";
import Resume from "./components/Resume/Resume";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  return (
    <Router basename="/unicode-toolset">
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/toolset" element={<Toolsets />} />
          <Route path="/invisible-char-editor" element={<InvisibleCharEditor />} />
          <Route path="/drunicode" element={<DrUnicodeWrapper />} />
          <Route path="/crash-char-sequence-generator" element={<CrashCharSequenceGenerator />} />
          <Route path="/*" element={<Navigate to={location.search.startsWith('?/') ? location.search.split('?')[1].replace("&", "?") : "/home"} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

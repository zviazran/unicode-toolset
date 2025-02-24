import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Toolsets from "./components/Toolset/Toolsets";
import InvisibleCharEditor from "./components/Toolset/InvisibleCharEditor/InvisibleCharEditor";
import DrUnicodeWrapper from "./components/Toolset/DrUnicode/DrUnicodeWrapper";
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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/?/about" element={<About />} />

          <Route path="/resume" element={<Resume />} />
          <Route path="/?/resume" element={<About />} />

          <Route path="/toolset" element={<Toolsets />} />
          <Route path="/?/toolset" element={<Toolsets />} />

          <Route path="/invisible-char-editor" element={<InvisibleCharEditor />} />
          <Route path="/?/invisible-char-editor" element={<InvisibleCharEditor />} />

          <Route path="/drunicode" element={<DrUnicodeWrapper />} />
          <Route path="/?/drunicode" element={<DrUnicodeWrapper />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./modules/About/About";
import Toolsets from "./modules/Toolsets/Toolsets";
import CodepointEditor from "./modules/CodepointEditor/CodepointEditor";
import DrUnicodeWrapper from "./modules/DrUnicode/DrUnicodeWrapper";
import CrashCharSequenceGenerator from "./modules/CrashCharSequenceGenerator/CrashCharSequenceGenerator";
import EncodedPromptInjectionGenerator from "./modules/EncodedPromptInjectionGenerator/EncodedPromptInjectionGenerator";
import UrlTwisterComponent from "./modules/UrlTwister/UrlTwisterComponent";
import WasThisYourText from "./modules/WasThisYourText/WasThisYourText";

import Footer from "./components/Footer";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  return (
    <Router basename="/unicode-toolset">
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/home" element={<Toolsets />} />
          <Route path="/about" element={<About />} />
          <Route path="/toolset" element={<Toolsets />} />
          <Route path="/char-editor" element={<CodepointEditor />} />
          <Route path="/invisible-char-editor" element={<CodepointEditor />} />
          <Route path="/drunicode" element={<DrUnicodeWrapper />} />
          <Route path="/crash-char-sequence-generator" element={<CrashCharSequenceGenerator />} />
          <Route path="/url-twister" element={<UrlTwisterComponent />} />
          <Route path="/encoded-prompt-injection-generator" element={<EncodedPromptInjectionGenerator />} />
          <Route path="/was-this-your-text" element={<WasThisYourText />} />
          <Route
            path="/*"
            element={
              location.search.startsWith("?/") ? (
                <Navigate
                  replace
                  to={(() => {
                    const raw = location.search.split('?')[1].split("~and~").join("&");
                    const parts = raw.split("&");

                    const path = parts[0]; 
                    const query = parts.slice(1).join("&");

                    return query ? `/${path}?${query}` : `/${path}`;
                  })()}
                />
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />

        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

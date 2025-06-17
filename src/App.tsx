import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./components/About/About";
import Toolsets from "./components/Toolset/Toolsets";
import CodepointEditor from "./components/Toolset/CodepointEditor/CodepointEditor";
import DrUnicodeWrapper from "./components/Toolset/DrUnicode/DrUnicodeWrapper";
import CrashCharSequenceGenerator from "./components/Toolset/CrashCharSequenceGenerator/CrashCharSequenceGenerator";
import EncodedPromptInjectionGenerator from "./components/Toolset/EncodedPromptInjectionGenerator/EncodedPromptInjectionGenerator";
import UrlTwisterComponent from "./components/Toolset/UrlTwister/UrlTwisterComponent";
import WasThisYourText from "./components/Toolset/WasThisYourText/WasThisYourText";

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

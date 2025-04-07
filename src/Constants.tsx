import INVISIBLE_CHAR_EDITOR from "./Assets/Toolsets/invisible-char-editor.png";
import DR_UNICODE from "./Assets/Toolsets/drunicode.png";
import CRASH_CHAR_SEQUENCE_GENERATOR from "./Assets/Toolsets/crash-char-sequence-generator.png";
import URL_TWISTER from "./Assets/Toolsets/url-twister.png";
import ENCODED_PROMPT_INJECTION_GENERATOR from "./Assets/Toolsets/encoded-prompt-injection-generator.png";

import UNICODE_CODE_CONVERTER from "./Assets/Recommendations/unicode-code-converter.png";
import UNICODE_UTILITIES_CONFUSABLES from "./Assets/Recommendations/unicode-utilities-confusables.png";
import UNICODE_TECHNICAL_SITE from "./Assets/Recommendations/unicode-technical-site.png";


export const TOOLSETS = [
  {
    image: INVISIBLE_CHAR_EDITOR,
    name: "Invisible Characters Editor",
    joke: "It's not a bug, it's an invisible character 👻",
    description: "Online tool to display and add invisible characters to text. To be used for simple homograph spoofing - when the computer and we see different things. Please use responsibly.",
    link: "invisible-char-editor",
  },
  {
    image: DR_UNICODE,
    name: "Dr. Unicode",
    joke: "An isValid(string) a day keeps the bugs away 🐞",
    description: "A heuristic utility for detecting and diagnosing common string corruptions, encoding issues, and alterations.",
    link: "drunicode",
  },
  {
    image: CRASH_CHAR_SEQUENCE_GENERATOR,
    name: "Crash Char Sequence Generator",
    joke: "Unicode. SMASH!!! 😱",
    description: "Generate a crash making character combination. Try this at your own risk.",
    link: "crash-char-sequence-generator",
  },
  {
    image: URL_TWISTER,
    name: "URL Twister",
    joke: "Let's twist again, like we got tricked last summer 🌀",
    description: "Enter a URL to generate random tricky spoofing versions. Would you be fooled?",
    link: "url-twister",
  },
  {
    image: ENCODED_PROMPT_INJECTION_GENERATOR,
    name: "Encoded Prompt Injection Generator",
    joke: "Humanities last chance to stop Skynet 🌐",
    description: "Explore how encoded inputs can trick AI systems.",
    link: "encoded-prompt-injection-generator",
  },
];

export const RECOMMENDATIONS = [
  {
    image: UNICODE_CODE_CONVERTER,
    name: "Unicode code converter",
    joke: "Daddy? Is it you? 🧐",
    description: "The swift army knife of unicode encodings.",
    link: "https://r12a.github.io/app-conversion/",
  },
  {
    image: UNICODE_UTILITIES_CONFUSABLES,
    name: "Unicode Utilities: Confusables",
    joke: "You got to homograph spoof that string! 🎭",
    description: "The best tool out there to make your perfect homograph exploit.",
    link: "https://util.unicode.org/UnicodeJsps/confusables.jsp",
  },
  {
    image: UNICODE_TECHNICAL_SITE,
    name: "Unicode Technical Site",
    joke: "The Bilble 📖",
    description: "Best Unicode documentation out there.",
    link: "https://www.unicode.org/main.html",
  },
];

export const JS_SKILLS = [
  { name: "TypeScript", initialRating: 4 },
  { name: "Nodejs", initialRating: 4 },
  { name: "React", initialRating: 4 },
  { name: "React-Native", initialRating: 3 },
  { name: "Html", initialRating: 4 },
  { name: "CSS", initialRating: 4 },
];

export const JS_TOOLS = [
    "Visual Studio Code", 
    "Git", 
    "Chrome DevTools", 
    "Npm (Node Package Manager)", 
    "Sublime Text", 
    "Postman"
  ];

export const CSHARP_SKILLS = [
  { name: ".NET Core", initialRating: 4 },
  { name: ".NET Framework", initialRating: 4 },
  { name: "LINQ", initialRating: 4 },
  { name: "Windows Forms", initialRating: 4 },
  { name: "WPF", initialRating: 3 },
  { name: "Unity (Game Development)", initialRating: 3 },
];

export const CSHARP_TOOLS = [
  "Visual Studio",
  "NuGet",
  "MSBuild",
  "SQLiteStudio",
  "Window Detective",
  "ILSpy (Decompiler)",
  "JetBrains dotTrace (Profiler)",
  "PowerShell",
];

export const CPP_SKILLS = [
  { name: "Windows API", initialRating: 4 },
  { name: "STL (Standard Template Library)", initialRating: 4 },
  { name: "Multithreading", initialRating: 4 },
  { name: "Memory Management", initialRating: 4 },
  { name: "Performance Optimization", initialRating: 4 },
  { name: "Networking (Sockets)", initialRating: 3 },
  { name: "Data Structures & Algorithms", initialRating: 4 },
];

export const CPP_TOOLS = [
  "Visual Studio",
  "GCC",
  "SysinternalsSuite (ProcMon, ProcExp ...)",
  "Api Monitor",
  "Processhacker",
  "CFF Explorer",
  "Fiddler",
];

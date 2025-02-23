import INVISIBLE_CHAR_EDITOR from "./Assets/Toolsets/invisible-char-editor.png";
import DR_UNICODE from "./Assets/Toolsets/drunicode.png";


export const TOOLSETS = [
  {
    image: INVISIBLE_CHAR_EDITOR,
    name: "Invisible Characters Editor",
    joke: "It's not a bug, it's an invisible character.",
    description: "Online tool to display and add invisible characters to text. To be used for simple homograph spoofing - when the computer and we see different things. Please use responsibly.",
    link: "invisible-char-editor",
  },
  {
    image: DR_UNICODE,
    name: "Dr. Unicode",
    joke: "An isValid(string) a day keeps the bugs away.",
    description: "A heuristic utility for detecting and diagnosing common string corruptions, encoding issues, and alterations.",
    link: "drunicode",
  }
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

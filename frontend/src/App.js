import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubDark } from "@uiw/codemirror-theme-github";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ErrorBoundary from "./components/ErrorBoundary";
import { saveCode, executeCode } from "./utils/api";
import "./App.css";
import "./styles/main.css";
import "./styles/bonus.css";

function App() {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vscodeDark");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [font, setFont] = useState("default");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const themes = {
    dracula: dracula,
    githubDark: githubDark,
    vscodeDark: vscodeDark,
  };

  const languages = {
    javascript: javascript(),
    python: python(),
    java: java(),
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setOutput("");
  };

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFontChange = (e) => {
    setFont(e.target.value);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSave = async () => {
    try {
      const data = await saveCode(code, language);
      alert(`Code saved successfully! ID: ${data.id}`);
    } catch (error) {
      alert("Error saving code");
    }
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("Executing...");
    try {
      const result = await executeCode(code, language);
      setOutput(result.output);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // New feature: Code hints system
  const getHint = () => {
    const hints = {
      javascript: {
        loops: "Try using for/while loops for repetitive tasks",
        functions: "Break down complex logic into smaller functions",
        arrays: "Array methods like map/filter/reduce can simplify your code",
        variables:
          "Use const for values that won't be reassigned, let otherwise",
      },
      python: {
        lists: "List comprehensions can make your code more concise",
        functions: "Use def to create reusable code blocks",
        loops: "for loops work great with Python's range() function",
        indentation: "Python uses indentation to define code blocks",
      },
      java: {
        classes: "Remember to define a public class matching your filename",
        methods: "Public static void main is your entry point",
        loops: "for, while, and do-while loops are available",
        types: "Java is strongly typed - declare variable types explicitly",
      },
    };

    const currentHints = hints[language];
    const hintKeys = Object.keys(currentHints);
    const randomHint =
      currentHints[hintKeys[Math.floor(Math.random() * hintKeys.length)]];
    setOutput(`Hint: ${randomHint}`);
  };

  // New feature: Code formatting
  const formatCode = () => {
    const formatted = code
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    setCode(formatted);
  };

  return (
    <ErrorBoundary>
      <div className={`App ${isFullScreen ? "fullscreen" : ""}`}>
        <h1>Online Code Editor</h1>
        <div className="editor-controls">
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <select value={theme} onChange={handleThemeChange}>
            <option value="vscodeDark">VS Code Dark</option>
            <option value="dracula">Dracula</option>
            <option value="githubDark">GitHub Dark</option>
          </select>
          <select value={font} onChange={handleFontChange}>
            <option value="default">Default</option>
            <option value="fira-code">Fira Code</option>
            <option value="jetbrains-mono">JetBrains Mono</option>
            <option value="source-code-pro">Source Code Pro</option>
          </select>
          <button onClick={toggleFullScreen}>
            {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
        <div className="editor-container">
          <CodeMirror
            value={code}
            height={isFullScreen ? "50vh" : "400px"}
            theme={themes[theme]}
            extensions={[languages[language]]}
            onChange={handleCodeChange}
            className={`editor-font-${font}`}
          />
          <div className="button-container">
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="run-button"
            >
              {isExecuting ? "Running..." : "Run Code"}
            </button>
            <button onClick={handleSave} className="save-button">
              Save Code
            </button>
            <button onClick={getHint} className="hint-button">
              Get Hint
            </button>
            <button onClick={formatCode} className="format-button">
              Format Code
            </button>
          </div>
          <div className="output-container">
            <h3>Output:</h3>
            <pre className="output">{output}</pre>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

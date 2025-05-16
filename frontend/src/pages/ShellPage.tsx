import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from "react";
import { useAuth } from "../hooks/useAuth"; // To get username for prompt
import { executeShellCommand } from "../services/fileService"; // Simulated service
import type { ApiError } from "../types";

interface HistoryEntry {
  id: number;
  type: "input" | "output" | "error";
  content: string;
  path?: string; // Path at the time of input
}

const initialWelcomeMessage: HistoryEntry = {
  id: Date.now(),
  type: "output",
  content: 'FEUP SecureFS Shell. Type "help" for available commands.',
};

/**
 * Page component for the Unix-like shell interface.
 */
const ShellPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([
    initialWelcomeMessage,
  ]); // Initialize with welcome
  const [inputValue, setInputValue] = useState("");
  const [currentPath, setCurrentPath] = useState("/"); // User's virtual current path
  const [isLoading, setIsLoading] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when history changes
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const processCommand = async (commandLine: string) => {
    const trimmedCommand = commandLine.trim();
    if (!trimmedCommand) return;

    const newHistoryEntry: HistoryEntry = {
      id: Date.now(),
      type: "input",
      content: trimmedCommand,
      path: currentPath,
    };

    // Client-side 'clear' command handling
    if (trimmedCommand.toLowerCase() === "clear") {
      setHistory([
        initialWelcomeMessage, // Optionally keep the welcome message
        newHistoryEntry, // Show the 'clear' command itself
        // Or setHistory([]); for a completely blank screen
      ]);
      setIsLoading(false); // Ensure loading is false
      return; // Don't send 'clear' to the backend
    }

    // Add command to history (if not 'clear')
    setHistory((prevHistory) => [...prevHistory, newHistoryEntry]);
    setIsLoading(true);

    try {
      const result = await executeShellCommand(trimmedCommand, currentPath);

      const outputEntries: HistoryEntry[] = [];
      if (result.output) {
        result.output.split("\n").forEach((line, index) => {
          outputEntries.push({
            id: Date.now() + index + 1,
            type: "output",
            content: line,
          });
        });
      }
      if (result.error) {
        outputEntries.push({
          id: Date.now() + outputEntries.length + 1,
          type: "error",
          content: result.error,
        });
      }

      setHistory((prev) => [...prev, ...outputEntries]);

      if (result.newPath !== undefined) {
        setCurrentPath(result.newPath);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "error",
          content: apiError.message || "An unexpected error occurred.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    processCommand(inputValue);
    setInputValue("");
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const prompt = `${user?.username || "user"}@feup-securefs:${currentPath}$ `;

  return (
    <div
      className="h-full flex flex-col bg-black text-white font-mono text-sm p-4 rounded-lg shadow-xl overflow-hidden"
      onClick={focusInput}
    >
      <div className="flex-grow overflow-y-auto pr-2" id="shell-output">
        {history.map((entry) => (
          <div key={entry.id} className="mb-1">
            {entry.type === "input" && (
              <div>
                <span className="text-green-400">
                  {user?.username || "user"}@feup-securefs:
                </span>
                <span className="text-blue-400">
                  {entry.path || currentPath}
                </span>
                <span className="text-gray-300">$ {entry.content}</span>
              </div>
            )}
            {entry.type === "output" && (
              <div className="text-gray-200 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}
            {entry.type === "error" && (
              <div className="text-red-400 whitespace-pre-wrap">
                Error: {entry.content}
              </div>
            )}
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center mt-2 shrink-0">
        <span className="text-green-400">
          {user?.username || "user"}@feup-securefs:
        </span>
        <span className="text-blue-400">{currentPath}</span>
        <span className="text-gray-300 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isLoading}
          className="flex-grow bg-transparent text-white focus:outline-none placeholder-gray-500"
          placeholder={isLoading ? "Processing..." : "Type a command..."}
          autoFocus
          spellCheck="false"
        />
      </form>
    </div>
  );
};

export default ShellPage;

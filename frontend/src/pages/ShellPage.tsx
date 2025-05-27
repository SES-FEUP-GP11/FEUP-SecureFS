import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { executeShellCommand } from "../services/fileService"; // Simulated service
import type { ApiError } from "../types";

interface HistoryEntry {
  id: number;
  type: "input" | "output" | "error";
  content: string;
  path?: string; // Path at the time of input
}

const initialWelcomeMessage: HistoryEntry = {
  id: Date.now(), // Using Date.now() for unique key, consider UUID for more robustness if needed
  type: "output",
  content: 'FEUP SecureFS Shell. Type "help" for available commands.',
};

/**
 * Page component for the Unix-like shell interface.
 * Commands are processed via an API call to a simulated backend service.
 */
const ShellPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([
    initialWelcomeMessage,
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentPath, setCurrentPath] = useState("/"); // User's virtual current path
  const [isLoading, setIsLoading] = useState(false); // For command processing state
  const endOfHistoryRef = useRef<HTMLDivElement>(null); // For auto-scrolling
  const inputRef = useRef<HTMLInputElement>(null); // To focus input

  // Effect to scroll to the bottom of the history when it updates
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  /**
   * Processes the entered command line.
   * Handles client-side 'clear' command or sends other commands to the service.
   * @param commandLine The command string entered by the user.
   */
  const processCommand = async (commandLine: string) => {
    const trimmedCommand = commandLine.trim();
    if (!trimmedCommand) return;

    const commandHistoryEntry: HistoryEntry = {
      id: Date.now(),
      type: "input",
      content: trimmedCommand,
      path: currentPath,
    };

    // Client-side handling for 'clear' command
    if (trimmedCommand.toLowerCase() === "clear") {
      setHistory([
        initialWelcomeMessage, // Optionally re-display welcome message
        commandHistoryEntry, // Show the 'clear' command itself
      ]);
      setIsLoading(false); // Ensure loading state is reset
      return; // Do not send 'clear' to the backend service
    }

    setHistory((prevHistory) => [...prevHistory, commandHistoryEntry]);
    setIsLoading(true);

    try {
      // Call the (simulated) backend service to execute the command
      const result = await executeShellCommand(trimmedCommand, currentPath);

      const outputEntries: HistoryEntry[] = [];
      if (result.output) {
        // Split multi-line output from backend into separate history entries if desired,
        // or display as a single block with preserved newlines.
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

      // Update current path if the command (e.g., 'cd') resulted in a path change
      if (result.newPath !== undefined) {
        setCurrentPath(result.newPath);
      }
    } catch (err) {
      const apiError = err as ApiError; // Type assertion
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "error",
          content:
            apiError.message ||
            "An unexpected error occurred processing the command.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    processCommand(inputValue);
    setInputValue(""); // Clear input field after submission
  };

  // Focus the input field when the terminal area is clicked
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Construct the prompt string
  const promptUserPart =
    user?.email?.split("@")[0] || user?.first_name || "user";

  return (
    <div
      className="h-full flex flex-col bg-black text-white font-mono text-sm p-4 rounded-lg shadow-xl overflow-hidden"
      onClick={focusInput} // Allows clicking anywhere on terminal to focus input
    >
      {/* Scrollable history area */}
      <div className="flex-grow overflow-y-auto pr-2" id="shell-output">
        {history.map((entry) => (
          <div key={entry.id} className="mb-1">
            {entry.type === "input" && (
              <div>
                <span className="text-green-400">
                  {promptUserPart}@feup-securefs:
                </span>
                <span className="text-blue-400">
                  {entry.path || currentPath}
                </span>
                <span className="text-gray-300">$ {entry.content}</span>
              </div>
            )}
            {entry.type === "output" && (
              // whitespace-pre-wrap preserves newlines and spaces from command output
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
        <div ref={endOfHistoryRef} />{" "}
        {/* Invisible element for auto-scrolling */}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center mt-2 shrink-0">
        <span className="text-green-400">{promptUserPart}@feup-securefs:</span>
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
          autoFocus // Automatically focus the input when the page loads
          spellCheck="false" // Disable browser spellcheck for command input
        />
      </form>
    </div>
  );
};

export default ShellPage;

import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
  useCallback,
} from "react";
import { useAuth } from "../hooks/useAuth";
import {
  listFiles,
  createFolder as createFolderService,
  fetchNodeDetailsByPath,
  deleteNode as deleteNodeService, // Import deleteNode service
} from "../services/fileService";
import type { ApiError, FileNode } from "../types";
import { useNavigate } from "react-router-dom";

interface HistoryEntry {
  id: number;
  type: "input" | "output" | "error" | "system";
  content: string;
  path?: string; // Path at the time of input
}

const initialWelcomeMessage: HistoryEntry = {
  id: Date.now(),
  type: "output",
  content: 'FEUP SecureFS Shell. Type "help" for available commands.',
};

// Helper to resolve paths like 'cd ..', 'cd /abs/path', 'cd relative_path'
const resolvePathClientSide = (current: string, target: string): string => {
  if (target.startsWith("/")) {
    const parts = target.split("/").filter((p) => p);
    return `/${parts.join("/")}` || "/";
  }
  const currentParts = current.split("/").filter((p) => p);
  const targetParts = target.split("/").filter((p) => p);

  for (const part of targetParts) {
    if (part === "..") {
      if (currentParts.length > 0) {
        currentParts.pop();
      }
    } else if (part !== "." && part !== "") {
      currentParts.push(part);
    }
  }
  return `/${currentParts.join("/")}` || "/";
};

const ShellPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>([
    initialWelcomeMessage,
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [isLoading, setIsLoading] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const addOutputToHistory = useCallback(
    (output: string, type: "output" | "error" | "system" = "output") => {
      setHistory((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), type, content: output },
      ]);
    },
    []
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const processCommand = async (commandLine: string) => {
    const trimmedCommand = commandLine.trim();
    if (!trimmedCommand) return;

    if (commandHistory[commandHistory.length - 1] !== trimmedCommand) {
      setCommandHistory((prev) => [...prev, trimmedCommand]);
    }
    setHistoryIndex(-1);
    const commandHistoryEntry: HistoryEntry = {
      id: Date.now(),
      type: "input",
      content: trimmedCommand,
      path: currentPath,
    };
    setHistory((prevHistory) => [...prevHistory, commandHistoryEntry]);
    setIsLoading(true);

    const [command, ...args] = trimmedCommand.split(/\s+/);

    try {
      switch (command.toLowerCase()) {
        case "clear":
          setHistory([initialWelcomeMessage, commandHistoryEntry]);
          break;
        case "help":
          addOutputToHistory(
            "Available commands:\n" +
              "  ls [path]          List directory contents\n" +
              "  cd <directory>     Change directory\n" +
              "  pwd                Print working directory\n" +
              "  mkdir <name>       Create directory in current path\n" +
              "  rm <path_to_item>  Remove a file or folder\n" +
              "  goto <path>        Open path in file browser\n" +
              "  clear              Clear the terminal\n" +
              "  help               Show this help message"
          );
          break;
        case "pwd":
          addOutputToHistory(currentPath);
          break;
        case "ls":
          const lsPathArg = args[0]
            ? resolvePathClientSide(currentPath, args[0])
            : currentPath;
          try {
            const items = await listFiles(lsPathArg);
            if (items.length === 0) {
              addOutputToHistory("(empty)");
            } else {
              const output = items
                .map((item) => `${item.name}${item.is_directory ? "/" : ""}`)
                .join("\n");
              addOutputToHistory(output);
            }
          } catch (e) {
            const apiErr = e as ApiError;
            addOutputToHistory(
              `ls: cannot access '${lsPathArg}': ${apiErr.message || "Error"}`,
              "error"
            );
          }
          break;
        case "cd":
          if (!args[0]) {
            addOutputToHistory("cd: missing operand", "error");
            break;
          }
          const targetCdPath = resolvePathClientSide(currentPath, args[0]);
          if (targetCdPath === "/") {
            // Allow cd to root without fetching details
            setCurrentPath("/");
            break;
          }
          try {
            const nodeDetails = await fetchNodeDetailsByPath(targetCdPath);
            if (nodeDetails && nodeDetails.is_directory)
              setCurrentPath(targetCdPath);
            else if (nodeDetails && !nodeDetails.is_directory)
              addOutputToHistory(`cd: ${args[0]}: Not a directory`, "error");
            else
              addOutputToHistory(
                `cd: ${args[0]}: No such file or directory (dev: check fetchNodeDetailsByPath)`,
                "error"
              );
          } catch (e) {
            const apiErr = e as ApiError;
            addOutputToHistory(
              `cd: ${args[0]}: ${apiErr.message || "Error validating path"}`,
              "error"
            );
          }
          break;
        case "mkdir":
          if (!args[0]) {
            addOutputToHistory("mkdir: missing operand", "error");
            break;
          }
          const newFolderName = args[0];
          try {
            let parentNodeIdForMkdir: string | null = null;
            if (currentPath !== "/") {
              const parentDetails = await fetchNodeDetailsByPath(currentPath);
              if (!parentDetails || !parentDetails.is_directory) {
                addOutputToHistory(
                  `mkdir: current path '${currentPath}' is not a valid directory.`,
                  "error"
                );
                break;
              }
              parentNodeIdForMkdir = parentDetails.id;
            }
            await createFolderService(newFolderName, parentNodeIdForMkdir);
            addOutputToHistory(
              `Directory '${newFolderName}' created in ${currentPath}.`
            );
          } catch (e) {
            const apiErr = e as ApiError;
            addOutputToHistory(
              `mkdir: ${apiErr.message || "Failed to create directory"}`,
              "error"
            );
          }
          break;
        case "rm":
          if (!args[0]) {
            addOutputToHistory(
              "rm: missing operand (file/folder path)",
              "error"
            );
            break;
          }
          const itemPathToDelete = resolvePathClientSide(currentPath, args[0]);
          if (itemPathToDelete === "/") {
            addOutputToHistory("rm: cannot remove root directory", "error");
            break;
          }
          try {
            // First, get the node ID to pass to the delete service
            const nodeDetails = await fetchNodeDetailsByPath(itemPathToDelete);
            if (!nodeDetails || !nodeDetails.id) {
              // Ensure nodeDetails and its id are valid
              addOutputToHistory(
                `rm: ${args[0]}: No such file or directory`,
                "error"
              );
              break;
            }
            // Optional: Add a client-side confirmation for 'rm' without -f,
            // or for directories, especially if not empty.
            // For now, direct delete.
            await deleteNodeService(nodeDetails.id);
            addOutputToHistory(`Removed '${itemPathToDelete}'`);
          } catch (e) {
            const apiErr = e as ApiError;
            addOutputToHistory(
              `rm: cannot remove '${args[0]}': ${apiErr.message || "Error"}`,
              "error"
            );
          }
          break;
        case "goto":
          if (!args[0]) {
            addOutputToHistory("goto: missing path", "error");
            break;
          }
          const gotoPath = resolvePathClientSide(currentPath, args[0]);
          addOutputToHistory(
            `Navigating to file browser: /files${gotoPath}`,
            "system"
          );
          navigate(`/files${gotoPath}`);
          break;
        default:
          addOutputToHistory(`${command}: command not found`, "error");
      }
    } catch (err) {
      const apiError = err as ApiError;
      addOutputToHistory(
        apiError.message || "An unexpected error occurred.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    processCommand(inputValue);
    setInputValue("");
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (commandHistory.length === 0) return;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const newIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInputValue(commandHistory[newIndex] || "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1 || historyIndex === commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInputValue("");
      } else {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex] || "");
      }
    }
  };
  const focusInput = () => {
    inputRef.current?.focus();
  };
  const promptUserPart =
    user?.email?.split("@")[0] || user?.first_name || "user";

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
                  {promptUserPart}@feup-securefs:
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
            {entry.type === "system" && (
              <div className="text-purple-400 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center mt-2 shrink-0">
        <span className="text-green-400">{promptUserPart}@feup-securefs:</span>
        <span className="text-blue-400">{currentPath}</span>
        <span className="text-gray-300 mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
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

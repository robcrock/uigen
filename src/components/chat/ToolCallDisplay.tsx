"use client";

import { Loader2, FilePlus, FileEdit, Eye, Trash2, ArrowRightLeft } from "lucide-react";

export interface ToolInvocation {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

interface ToolCallDisplayProps {
  toolInvocation: ToolInvocation;
}

interface ToolCallInfo {
  message: string;
  icon: "create" | "edit" | "view" | "delete" | "rename" | "unknown";
}

/**
 * Parses a tool invocation and returns a user-friendly message and icon type.
 */
export function getToolCallInfo(
  toolName: string,
  args: Record<string, unknown> = {}
): ToolCallInfo {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;

    if (!path) {
      return {
        message: toolName,
        icon: "unknown",
      };
    }

    switch (command) {
      case "create":
        return {
          message: `Creating ${path}`,
          icon: "create",
        };
      case "str_replace":
        return {
          message: `Editing ${path}`,
          icon: "edit",
        };
      case "insert":
        return {
          message: `Editing ${path}`,
          icon: "edit",
        };
      case "view":
        return {
          message: `Reading ${path}`,
          icon: "view",
        };
      case "undo_edit":
        return {
          message: `Undoing ${path}`,
          icon: "edit",
        };
      default:
        return {
          message: command ? `${command} ${path}` : toolName,
          icon: "unknown",
        };
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = args.path as string | undefined;
    const newPath = args.new_path as string | undefined;

    if (!path) {
      return {
        message: toolName,
        icon: "unknown",
      };
    }

    switch (command) {
      case "rename":
        return {
          message: newPath ? `Moving ${path} → ${newPath}` : `Moving ${path}`,
          icon: "rename",
        };
      case "delete":
        return {
          message: `Deleting ${path}`,
          icon: "delete",
        };
      default:
        return {
          message: command ? `${command} ${path}` : toolName,
          icon: "unknown",
        };
    }
  }

  return {
    message: toolName,
    icon: "unknown",
  };
}

function ToolIcon({ type, className }: { type: ToolCallInfo["icon"]; className?: string }) {
  switch (type) {
    case "create":
      return <FilePlus className={className} />;
    case "edit":
      return <FileEdit className={className} />;
    case "view":
      return <Eye className={className} />;
    case "delete":
      return <Trash2 className={className} />;
    case "rename":
      return <ArrowRightLeft className={className} />;
    default:
      return null;
  }
}

export function ToolCallDisplay({ toolInvocation }: ToolCallDisplayProps) {
  const { toolName, args, state, result } = toolInvocation;
  const isComplete = state === "result" && result !== undefined;
  const info = getToolCallInfo(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <ToolIcon type={info.icon} className="w-3 h-3 text-neutral-500 shrink-0" />
      <span className="text-neutral-700">{info.message}</span>
    </div>
  );
}

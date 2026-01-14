import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, getToolCallInfo, ToolInvocation } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

describe("getToolCallInfo", () => {
  describe("str_replace_editor tool", () => {
    test("returns create message for create command", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "create",
        path: "/src/components/Button.tsx",
      });
      expect(result.message).toBe("Creating /src/components/Button.tsx");
      expect(result.icon).toBe("create");
    });

    test("returns edit message for str_replace command", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "str_replace",
        path: "/src/lib/utils.ts",
      });
      expect(result.message).toBe("Editing /src/lib/utils.ts");
      expect(result.icon).toBe("edit");
    });

    test("returns edit message for insert command", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "insert",
        path: "/src/App.tsx",
      });
      expect(result.message).toBe("Editing /src/App.tsx");
      expect(result.icon).toBe("edit");
    });

    test("returns view message for view command", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "view",
        path: "/README.md",
      });
      expect(result.message).toBe("Reading /README.md");
      expect(result.icon).toBe("view");
    });

    test("returns undo message for undo_edit command", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "undo_edit",
        path: "/src/index.ts",
      });
      expect(result.message).toBe("Undoing /src/index.ts");
      expect(result.icon).toBe("edit");
    });

    test("returns fallback for unknown command with path", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "unknown_cmd",
        path: "/some/file.ts",
      });
      expect(result.message).toBe("unknown_cmd /some/file.ts");
      expect(result.icon).toBe("unknown");
    });

    test("returns tool name when path is missing", () => {
      const result = getToolCallInfo("str_replace_editor", {
        command: "create",
      });
      expect(result.message).toBe("str_replace_editor");
      expect(result.icon).toBe("unknown");
    });
  });

  describe("file_manager tool", () => {
    test("returns move message for rename command", () => {
      const result = getToolCallInfo("file_manager", {
        command: "rename",
        path: "/old/path.ts",
        new_path: "/new/path.ts",
      });
      expect(result.message).toBe("Moving /old/path.ts → /new/path.ts");
      expect(result.icon).toBe("rename");
    });

    test("returns move message without newPath if missing", () => {
      const result = getToolCallInfo("file_manager", {
        command: "rename",
        path: "/old/path.ts",
      });
      expect(result.message).toBe("Moving /old/path.ts");
      expect(result.icon).toBe("rename");
    });

    test("returns delete message for delete command", () => {
      const result = getToolCallInfo("file_manager", {
        command: "delete",
        path: "/temp/file.ts",
      });
      expect(result.message).toBe("Deleting /temp/file.ts");
      expect(result.icon).toBe("delete");
    });

    test("returns fallback for unknown command", () => {
      const result = getToolCallInfo("file_manager", {
        command: "copy",
        path: "/some/file.ts",
      });
      expect(result.message).toBe("copy /some/file.ts");
      expect(result.icon).toBe("unknown");
    });

    test("returns tool name when path is missing", () => {
      const result = getToolCallInfo("file_manager", {
        command: "delete",
      });
      expect(result.message).toBe("file_manager");
      expect(result.icon).toBe("unknown");
    });
  });

  describe("edge cases", () => {
    test("returns tool name for unknown tool", () => {
      const result = getToolCallInfo("unknown_tool", { some: "args" });
      expect(result.message).toBe("unknown_tool");
      expect(result.icon).toBe("unknown");
    });

    test("handles empty args object", () => {
      const result = getToolCallInfo("str_replace_editor", {});
      expect(result.message).toBe("str_replace_editor");
      expect(result.icon).toBe("unknown");
    });

    test("handles undefined args with default parameter", () => {
      // Testing the default parameter behavior
      const result = getToolCallInfo("some_tool", undefined as unknown as Record<string, unknown>);
      expect(result.message).toBe("some_tool");
      expect(result.icon).toBe("unknown");
    });
  });
});

describe("ToolCallDisplay component", () => {
  test("renders loading state when not complete", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/src/Button.tsx" },
      state: "pending",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Creating /src/Button.tsx")).toBeDefined();
    // Check for spinner (Loader2 should be present)
    const container = screen.getByText("Creating /src/Button.tsx").closest("div");
    expect(container?.querySelector(".animate-spin")).toBeDefined();
  });

  test("renders complete state when result exists", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/src/Button.tsx" },
      state: "result",
      result: "File created successfully",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Creating /src/Button.tsx")).toBeDefined();
    // Check for green indicator dot
    const container = screen.getByText("Creating /src/Button.tsx").closest("div");
    expect(container?.querySelector(".bg-emerald-500")).toBeDefined();
  });

  test("renders correct message for edit operation", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "str_replace_editor",
      args: { command: "str_replace", path: "/src/utils.ts" },
      state: "result",
      result: "OK",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Editing /src/utils.ts")).toBeDefined();
  });

  test("renders correct message for view operation", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "str_replace_editor",
      args: { command: "view", path: "/package.json" },
      state: "result",
      result: "{}",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Reading /package.json")).toBeDefined();
  });

  test("renders correct message for file_manager delete", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "file_manager",
      args: { command: "delete", path: "/temp.ts" },
      state: "result",
      result: { success: true },
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Deleting /temp.ts")).toBeDefined();
  });

  test("renders correct message for file_manager rename", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "file_manager",
      args: { command: "rename", path: "/old.ts", new_path: "/new.ts" },
      state: "result",
      result: { success: true },
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("Moving /old.ts → /new.ts")).toBeDefined();
  });

  test("has correct CSS classes", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "str_replace_editor",
      args: { command: "create", path: "/test.tsx" },
      state: "result",
      result: "OK",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    const container = screen.getByText("Creating /test.tsx").closest("div");
    expect(container?.className).toContain("bg-neutral-50");
    expect(container?.className).toContain("border-neutral-200");
    expect(container?.className).toContain("rounded-lg");
  });

  test("renders unknown tool name as fallback", () => {
    const toolInvocation: ToolInvocation = {
      toolName: "custom_tool",
      args: {},
      state: "result",
      result: "OK",
    };

    render(<ToolCallDisplay toolInvocation={toolInvocation} />);

    expect(screen.getByText("custom_tool")).toBeDefined();
  });
});

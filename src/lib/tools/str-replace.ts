import { tool } from "ai";
import { z } from "zod";
import { VirtualFileSystem } from "@/lib/file-system";

export const buildStrReplaceTool = (fileSystem: VirtualFileSystem) => {
  return tool({
    description: `A tool for viewing, creating, and editing files.

Commands:
- view: View the contents of a file. Use view_range to see specific line ranges.
- create: Create a new file with the given content. Use path for the file path and file_text for the content.
- str_replace: Replace text in an existing file. Use old_str for text to find and new_str for replacement text. The old_str must match EXACTLY.
- insert: Insert text at a specific line number. Use insert_line for the line number and new_str for the text to insert.`,
    parameters: z.object({
      command: z.enum(["view", "create", "str_replace", "insert", "undo_edit"]).describe("The operation to perform"),
      path: z.string().describe("The file path to operate on"),
      file_text: z.string().optional().describe("The content for creating a new file"),
      insert_line: z.number().optional().describe("The line number for insert command"),
      new_str: z.string().optional().describe("The new text for str_replace or insert"),
      old_str: z.string().optional().describe("The text to find for str_replace"),
      view_range: z.array(z.number()).optional().describe("Line range [start, end] for view command"),
    }),
    execute: async ({
      command,
      path,
      file_text,
      insert_line,
      new_str,
      old_str,
      view_range,
    }) => {
      switch (command) {
        case "view":
          return fileSystem.viewFile(
            path,
            view_range as [number, number] | undefined
          );

        case "create":
          return fileSystem.createFileWithParents(path, file_text || "");

        case "str_replace":
          return fileSystem.replaceInFile(path, old_str || "", new_str || "");

        case "insert":
          return fileSystem.insertInFile(path, insert_line || 0, new_str || "");

        case "undo_edit":
          return `Error: undo_edit command is not supported in this version. Use str_replace to revert changes.`;
      }
    },
  });
};

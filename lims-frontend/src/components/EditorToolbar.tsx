import React from "react";
import CustomIconButton from "../@core/components/mui/IconButton";

export default function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 p-6">
      <CustomIconButton
        {...(editor.isActive("bold") && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300" // White in light mode, light gray in dark mode
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className="tabler-bold" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive("underline") && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className="tabler-underline" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive("italic") && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className="tabler-italic" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive("strike") && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className="tabler-strikethrough" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive({ textAlign: "left" }) && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <i className="tabler-align-left" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive({ textAlign: "center" }) && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <i className="tabler-align-center" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive({ textAlign: "right" }) && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <i className="tabler-align-right" />
      </CustomIconButton>

      <CustomIconButton
        {...(editor.isActive({ textAlign: "justify" }) && { color: "primary" })}
        variant="outlined"
        size="small"
        className="bg-white dark:bg-gray-300"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <i className="tabler-align-justified" />
      </CustomIconButton>
    </div>
  );
}

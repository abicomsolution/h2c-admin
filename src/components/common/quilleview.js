"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { useMemo } from "react";

// IMPORTANT: disable SSR
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });


export default function RichTextEditor({
  value,
  placeholder = "Write something...",
  readOnly = false,
}) {


  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "blockquote",
      "code-block",
      "link",
      "image",
      "align",
      "color",
      "background",
    ],
    []
  );

  return (
    <div className="w-full">
      <ReactQuill
        theme="snow"
        value={value}      
        placeholder={placeholder}
        readOnly={readOnly}
        modules={{toolbar: false}}
        formats={formats}
        className="qv-container"
      />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("react-simple-wysiwyg"), { ssr: false });

type EmailEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function EmailEditor({ value, onChange, placeholder }: EmailEditorProps) {
  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 [&_.rsw-editor]:min-h-[200px] [&_.rsw-editor]:p-4 [&_.rsw-editor]:text-zinc-100 [&_.rsw-ce]:outline-none">
      <Editor value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

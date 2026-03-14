import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Undo, Redo, Heading1, Heading2, Link as LinkIcon 
} from "lucide-react";
import { Button } from "./ui/button";

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('URL du lien :');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-slate-200 p-2 flex flex-wrap gap-1 bg-slate-50">
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-slate-200' : ''}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-slate-200' : ''}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-slate-200' : ''}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-slate-200' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        size="sm" variant="ghost" type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-slate-200' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={addLink}>
        <LinkIcon className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4 text-slate-700',
      },
    },
  });

  // Mise à jour si le contenu change (mode édition)
  if (editor && editor.getHTML() !== content && content !== "") {
    editor.commands.setContent(content);
  }

  return (
    <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0A2A5C] bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
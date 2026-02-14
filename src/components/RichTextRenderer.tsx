import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

import { JSONContent } from '@tiptap/react';

interface RichTextRendererProps {
  content: JSONContent;
  className?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: true,
        },
      }),
      Image,
    ],
    content: content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: className || 'prose max-w-none text-gray-700',
      },
    },
  }, [content]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
};

export default RichTextRenderer;

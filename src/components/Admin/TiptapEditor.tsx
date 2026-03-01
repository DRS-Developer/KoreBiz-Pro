import React, { useState, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import MediaLibraryModal from './Media/MediaLibraryModal';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, 
  Link as LinkIcon, Image as ImageIcon, Heading1, Heading2, 
  Quote, Undo, Redo 
} from 'lucide-react';
import { toast } from 'sonner';
import { THEME_COLORS } from '../../constants/themeColors';

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

const MenuBar = ({ editor, onOpenMedia }: { editor: any, onOpenMedia: () => void }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // validate URL
    if (url && !/^https?:\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      toast.error('URL inválida. Deve começar com http://, https://, /, mailto: ou tel:');
      return;
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ onClick, isActive = false, disabled = false, title, children }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      className={`p-2 rounded ${
        isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <div className="flex gap-1 border-r pr-2 mr-1 border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Desfazer"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Refazer"
        >
          <Redo size={18} />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1 border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrito"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Itálico"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Sublinhado"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Tachado"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1 border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1 border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à Esquerda"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Centralizar"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à Direita"
        >
          <AlignRight size={18} />
        </ToolbarButton>
      </div>

      <div className="flex gap-1 border-r pr-2 mr-1 border-gray-300">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista com Marcadores"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Lista Numerada"
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quote size={18} />
        </ToolbarButton>
      </div>

      <div className="flex gap-1">
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={onOpenMedia}
          title="Inserir Imagem da Biblioteca"
        >
          <ImageIcon size={18} />
        </ToolbarButton>
      </div>
    </div>
  );
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder,
}) => {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  
  // Normalize content to check if it's truly empty
  const isContentEmpty = (content: string | object | null | undefined) => {
    if (!content) return true;
    
    // If it's an object (JSON), we assume it's valid content for Tiptap
    if (typeof content !== 'string') {
      return false; 
    }

    const cleanHtml = content.replace(/<[^>]*>?/gm, '').trim();
    return cleanHtml === '' && !content.includes('<img');
  };

  const extensions = useMemo(() => [
    StarterKit.configure({
      link: {
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: 'text-blue-600 underline',
        },
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto shadow-md my-4',
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: placeholder || 'Comece a escrever...',
    }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (isContentEmpty(html)) {
        onChange('');
      } else {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none p-4 focus:outline-none min-h-[250px]',
      },
    },
  }, [extensions]);

  // Sync editor content when value prop changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Only update if it's not just a normalization difference
      const isBothEmpty = isContentEmpty(value) && isContentEmpty(editor.getHTML());
      if (!isBothEmpty) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    }
  }, [value, editor]);

  const handleSelectImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setMediaModalOpen(false);
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className={`border rounded-lg bg-white ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <MenuBar editor={editor} onOpenMedia={() => setMediaModalOpen(true)} />
        <EditorContent editor={editor} className="cursor-text" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleSelectImage}
      />

      {/* CSS para personalizar o Tiptap (ProseMirror) se necessário */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: ${THEME_COLORS.gray.placeholder};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link, Image, Undo, Redo, 
  Type, Palette, RefreshCw
} from 'lucide-react';

export default function RichTextEditor({ onChange, initialContent = '' }) {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [selectedText, setSelectedText] = useState('');
  
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setSelectedText(range.toString());
      }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.addEventListener('input', handleContentChange);
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleContentChange);
      }
    };
  }, []);

  const handleContentChange = () => {
    if (!editorRef.current) return;
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };
  
  const insertLink = () => {
    if (selectedText) {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        formatText('createLink', url);
      }
    } else {
      alert('Please select text to convert to link');
    }
  };
  
  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const clearFormatting = () => {
    formatText('removeFormat');
  };

  // Toolbar button component for consistent styling
  const ToolbarBtn = ({ onClick, icon: Icon, tooltip }) => (
    <button 
      onClick={onClick}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center group relative"
      title={tooltip}
      type="button"
    >
      <Icon size={18} className="text-gray-700 dark:text-gray-300" />
      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
        {tooltip}
      </span>
    </button>
  );

  return (
    <div className="overflow-hidden border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex space-x-1 items-center border-r pr-2 border-gray-300 dark:border-gray-600">
          <ToolbarBtn onClick={() => formatText('bold')} icon={Bold} tooltip="Bold" />
          <ToolbarBtn onClick={() => formatText('italic')} icon={Italic} tooltip="Italic" />
          <ToolbarBtn onClick={() => formatText('underline')} icon={Underline} tooltip="Underline" />
        </div>
        
        <div className="flex space-x-1 items-center border-r pr-2 border-gray-300 dark:border-gray-600">
          <ToolbarBtn onClick={() => formatText('justifyLeft')} icon={AlignLeft} tooltip="Align Left" />
          <ToolbarBtn onClick={() => formatText('justifyCenter')} icon={AlignCenter} tooltip="Align Center" />
          <ToolbarBtn onClick={() => formatText('justifyRight')} icon={AlignRight} tooltip="Align Right" />
        </div>
        
        <div className="flex space-x-1 items-center border-r pr-2 border-gray-300 dark:border-gray-600">
          <ToolbarBtn onClick={() => formatText('insertUnorderedList')} icon={List} tooltip="Bullet List" />
          <ToolbarBtn onClick={() => formatText('insertOrderedList')} icon={ListOrdered} tooltip="Numbered List" />
        </div>
        
        <div className="flex space-x-1 items-center border-r pr-2 border-gray-300 dark:border-gray-600">
          <ToolbarBtn onClick={insertLink} icon={Link} tooltip="Insert Link" />
          <ToolbarBtn onClick={insertImage} icon={Image} tooltip="Insert Image" />
        </div>
        
        <div className="flex space-x-1 items-center border-r pr-2 border-gray-300 dark:border-gray-600">
          <ToolbarBtn onClick={() => formatText('undo')} icon={Undo} tooltip="Undo" />
          <ToolbarBtn onClick={() => formatText('redo')} icon={Redo} tooltip="Redo" />
          <ToolbarBtn onClick={clearFormatting} icon={RefreshCw} tooltip="Clear Formatting" />
        </div>
        
        <div className="flex space-x-2 items-center">
          <div className="relative group">
            <Type size={18} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <select 
              className="pl-8 pr-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => formatText('formatBlock', e.target.value)}
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="blockquote">Blockquote</option>
              <option value="pre">Code Block</option>
            </select>
          </div>
          
          <div className="relative group">
            <Palette size={18} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input 
              type="color" 
              className="ml-6 w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
              onChange={(e) => formatText('foreColor', e.target.value)}
              title="Text Color"
            />
          </div>
        </div>
      </div>
      
      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-56 focus:outline-none text-gray-800 dark:text-gray-200 transition-all duration-200 ease-in-out"
        onInput={(e) => {
          const newContent = e.currentTarget.innerHTML;
          setContent(newContent);
          if (onChange) {
            onChange(newContent);
          }
        }}
        spellCheck="true"
      />
      
      {/* Word count and character info */}
      <div className="flex justify-end p-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}

RichTextEditor.propTypes = {
  onChange: PropTypes.func,
  initialContent: PropTypes.string
};

RichTextEditor.defaultProps = {
  onChange: () => {},
  initialContent: ''
};
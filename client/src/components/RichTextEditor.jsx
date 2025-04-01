import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'flowbite-react';

export default function RichTextEditor({ onChange, initialContent = '' }) {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  
  const handleContentChange = () => {
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleContentChange();
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('bold')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          <b>B</b>
        </Button>
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('italic')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          <i>I</i>
        </Button>
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('underline')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          <u>U</u>
        </Button>
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('justifyLeft')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          ←
        </Button>
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('justifyCenter')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          ↔
        </Button>
        <Button 
          size="sm" 
          color="gray" 
          pill 
          onClick={() => formatText('justifyRight')}
          className="dark:bg-gray-600 dark:hover:bg-gray-500"
        >
          →
        </Button>
        <select 
          className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          onChange={(e) => formatText('formatBlock', e.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <select 
          className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          onChange={(e) => formatText('fontName', e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
        <input 
          type="color" 
          className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          onChange={(e) => formatText('foreColor', e.target.value)}
        />
      </div>
      
      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-36 focus:outline-none text-gray-900 dark:text-white"
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
      />
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
import { useEffect, useRef } from 'react';
import * as monaco from '@monaco-editor/react';

function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="h-full">
      <monaco.Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={value}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </div>
  );
}

export default CodeEditor; 
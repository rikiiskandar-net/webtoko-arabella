"use client";
import React, { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = (e) => {
    if (onChange) {
      onChange(e.currentTarget.innerHTML);
    }
  };

  const execCmd = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ background: '#F8FAFC', padding: '8px', borderBottom: '1px solid #CBD5E1', display: 'flex', gap: '4px' }}>
        <button type="button" onClick={() => execCmd('bold')} style={toolbarBtnStyle}><b>B</b></button>
        <button type="button" onClick={() => execCmd('italic')} style={toolbarBtnStyle}><i>I</i></button>
        <button type="button" onClick={() => execCmd('underline')} style={toolbarBtnStyle}><u>U</u></button>
        <div style={{ width: '1px', background: '#CBD5E1', margin: '0 4px' }} />
        <button type="button" onClick={() => execCmd('insertUnorderedList')} style={toolbarBtnStyle}>• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} style={toolbarBtnStyle}>1. List</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight: '200px',
          padding: '12px',
          outline: 'none',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}
      />
    </div>
  );
}

const toolbarBtnStyle = {
  padding: '4px 8px',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  color: '#334155'
};

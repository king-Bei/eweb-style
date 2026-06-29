import { useRef } from 'react';
import { List, ListOrdered } from 'lucide-react';

const stripListPrefix = line => line.replace(/^(?:\d+[.)]|\(\d+\)|[-*•])\s*/, '');

export default function NoticeContentEditor({ value = '', onChange, rows = 4, required = false, placeholder = '' }) {
  const textareaRef = useRef(null);

  const applyList = ordered => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    if (selectionStart === selectionEnd) {
      const prefix = ordered ? '1. ' : '- ';
      const nextValue = `${value.slice(0, selectionStart)}${prefix}${value.slice(selectionEnd)}`;
      onChange(nextValue);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
      });
      return;
    }

    const blockStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const nextBreak = value.indexOf('\n', selectionEnd);
    const blockEnd = nextBreak === -1 ? value.length : nextBreak;
    const selectedLines = value.slice(blockStart, blockEnd).split('\n');
    const formatted = selectedLines
      .map((line, index) => `${ordered ? `${index + 1}.` : '-'} ${stripListPrefix(line)}`)
      .join('\n');
    const nextValue = `${value.slice(0, blockStart)}${formatted}${value.slice(blockEnd)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(blockStart, blockStart + formatted.length);
    });
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-1">
        <button type="button" className="editor-icon-button" onClick={() => applyList(false)} title="套用項目符號">
          <List size={16} />
        </button>
        <button type="button" className="editor-icon-button" onClick={() => applyList(true)} title="套用編號清單">
          <ListOrdered size={16} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        className="form-control"
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </div>
  );
}

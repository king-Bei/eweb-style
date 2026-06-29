import { useEffect } from 'react';
import { unstable_usePrompt } from 'react-router-dom';

export const UNSAVED_CHANGES_MESSAGE = '目前有尚未儲存的變更，離開前請先儲存。確定要離開嗎？';

export default function useUnsavedChangesWarning(isDirty) {
  unstable_usePrompt({ when: isDirty, message: UNSAVED_CHANGES_MESSAGE });

  useEffect(() => {
    if (!isDirty) return undefined;

    const handleBeforeUnload = event => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

}

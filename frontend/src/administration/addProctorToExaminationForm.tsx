import React, { useEffect, useRef, useState } from 'react';
import useI18n from '../hooks/i18n.ts';
import createClient from 'openapi-fetch';
import { paths } from '../lib/api/v3';

const { PUT } = createClient<paths>();
const DEFAULT_REALM = 'su.se';

interface AddProctorToExaminationFormProps {
  examinationId: string;
  onSubmit: (principal: string) => void;
  cancel: () => void;
}

export default function AddProctorToExaminationForm({ onSubmit, examinationId, cancel }: AddProctorToExaminationFormProps) {
  const i18n = useI18n();
  const principalInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    principalInput.current?.focus();
  }, []);

  const addProctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const principal = principalInput.current?.value;
    if (!principal) return;
    const fullPrincipal = `${principal}@${DEFAULT_REALM}`;

    const { response, error } = await PUT(`/api/administration/examination/{examinationId}/proctors`, {
      params: { path: { examinationId } },
      body: { principal: fullPrincipal },
    });

    if (response.ok) {
      onSubmit(fullPrincipal);
      principalInput.current.value = '';
    } else if (error) {
      if (response.status >= 500) {
        setError(i18n['Internal server error']);
      } else {
        setError(i18n['Failed to add proctor'](error));
      }
    }
  };

  return (
    <form onSubmit={addProctor}>
      <div className="input-group mb-3">
        <input ref={principalInput} type="text" className="form-control" />
        <span className="input-group-text">@{DEFAULT_REALM}</span>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <button type="submit" className="btn btn-primary">
        {i18n['Add']}
      </button>
      <button className={'btn btn-link'} onClick={cancel}>
        {i18n['Cancel']}
      </button>
    </form>
  );
}

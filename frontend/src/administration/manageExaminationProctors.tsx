import useI18n from '../hooks/i18n.ts';
import React, { useRef, useState } from 'react';
import { useFetch } from '../fetch.ts';
import { paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';

const { GET, PUT } = createClient<paths>();
const DEFAULT_REALM = 'su.se';

interface ManageExaminationProctorsProps {
  examinationId: string;
}

export default function ManageExaminationProctors({ examinationId }: ManageExaminationProctorsProps) {
  const i18n = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const principalInput = useRef<HTMLInputElement>(null);

  const proctors = useFetch(
    () => GET(`/api/administration/examination/{examinationId}/proctors`, { params: { path: { examinationId } } }),
    [examinationId],
  );

  const addProctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const principal = principalInput.current?.value;
    if (!principal) return;
    const fullPrincipal = `${principal}@${DEFAULT_REALM}`;

    const response = await PUT(`/api/administration/examination/{examinationId}/proctors`, {
      params: { path: { examinationId } },
      body: { principal: fullPrincipal },
    });

    if (response.response.ok) {
      proctors.setData((oldProctors) => [...(oldProctors ?? []), { principal: fullPrincipal }]);
    }
    principalInput.current.value = '';
  };

  return (
    <>
      <Fetch response={proctors}>
        {(proctors) => {
          return (
            <>
              <ul>
                {proctors.map((proctor) => {
                  return <li key={proctor.principal}>{proctor.principal}</li>;
                })}
              </ul>

              {!isAdding && (
                <button className={'btn btn-sm btn-link'} onClick={() => setIsAdding(true)}>
                  {i18n['Add proctors']}
                </button>
              )}
              {isAdding && (
                <form onSubmit={addProctor}>
                  <div className="input-group mb-3">
                    <input ref={principalInput} type="text" className="form-control" />
                    <span className="input-group-text">@{DEFAULT_REALM}</span>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    {i18n['Add']}
                  </button>
                  <button className={'btn btn-link'} onClick={() => setIsAdding(false)}>
                    {i18n['Cancel']}
                  </button>
                </form>
              )}
            </>
          );
        }}
      </Fetch>
    </>
  );
}

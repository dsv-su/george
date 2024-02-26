import useI18n from '../hooks/i18n.ts';
import { useState } from 'react';
import { useFetch } from '../fetch.ts';
import { paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';
import AddProctorToExaminationForm from './addProctorToExaminationForm.tsx';

const { GET } = createClient<paths>();

interface ManageExaminationProctorsProps {
  examinationId: string;
}

export default function ManageExaminationProctors({ examinationId }: ManageExaminationProctorsProps) {
  const i18n = useI18n();
  const [isAdding, setIsAdding] = useState(false);

  const proctors = useFetch(
    () => GET(`/api/administration/examination/{examinationId}/proctors`, { params: { path: { examinationId } } }),
    [examinationId],
  );

  const addProctor = (fullPrincipal: string) => {
    proctors.setData((oldProctors) => [...(oldProctors ?? []), { principal: fullPrincipal }]);
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
                <AddProctorToExaminationForm examinationId={examinationId} onSubmit={addProctor} cancel={() => setIsAdding(false)} />
              )}
            </>
          );
        }}
      </Fetch>
    </>
  );
}

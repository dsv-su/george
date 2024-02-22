import useI18n from '../hooks/i18n.ts';
import { useState } from 'react';
import { useFetch } from '../fetch.ts';
import { paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';

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

  return (
    <>
      <Fetch response={proctors}>
        {(proctors) => {
          return (
            <ul>
              {proctors.map((proctor) => {
                return <li key={proctor.principal}>{proctor.principal}</li>;
              })}
            </ul>
          );
        }}
      </Fetch>
      {!isAdding && (
        <button className={'btn btn-sm btn-link'} onClick={() => setIsAdding(true)}>
          {i18n['Add proctors']}
        </button>
      )}
      {isAdding && (
        <form>
          <div className="input-group mb-3">
            <input type="text" className="form-control" />
            <span className="input-group-text">@su.se</span>
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
}

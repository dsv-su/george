import { paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import React, { useCallback, useEffect, useState } from 'react';
import { ProblemDetail } from '../fetch.ts';
import useI18n from '../hooks/i18n.ts';

const { GET, PUT } = createClient<paths>();

interface ManageExaminationCandidatesProps {
  examinationId: string;
}

interface Candidate {
  principal: string;
}

export default function ManageExaminationCandidates({ examinationId }: ManageExaminationCandidatesProps) {
  const [candidates, setCandidates] = useState<Candidate[]>();
  const [problem, setProblem] = useState<ProblemDetail>();
  const [error, setError] = useState<Error>();
  const [isAdding, setIsAdding] = useState(false);
  const i18n = useI18n();

  useEffect(() => {
    GET(`/api/administration/examination/{examinationId}/candidates`, { params: { path: { examinationId } } })
      .then(({ data, error, response }) => {
        if (error) {
          if (response.status === 400) {
            setProblem(error as ProblemDetail);
          } else {
            setError(new Error('Internal server error'));
          }
        } else if (data) {
          setCandidates(data);
        }
      })
      .catch((e) => {
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error(String(e)));
        }
      });
  }, [examinationId]);

  const candidateAdded = useCallback(
    (candidate: string) => {
      setCandidates((oldCandidates) => [...(oldCandidates ?? []), { principal: candidate }]);
    },
    [setCandidates],
  );

  return (
    <>
      {error && <p>Error: {error.message}</p>}
      {problem && <p>Problem: {problem.detail}</p>}
      {candidates && (
        <>
          <ul>
            {candidates.map((candidate) => {
              return <li key={candidate.principal}>{candidate.principal}</li>;
            })}
          </ul>

          {!isAdding && (
            <button className={'btn btn-sm btn-link'} onClick={() => setIsAdding(true)}>
              {i18n['Add candidates']}
            </button>
          )}
          {isAdding && (
            <AddCandidatesToExaminationForm examinationId={examinationId} onSubmit={candidateAdded} cancel={() => setIsAdding(false)} />
          )}
        </>
      )}
    </>
  );
}

interface AddCandidatesToExaminationFormProps {
  cancel: () => void;
  onSubmit: (candidate: string) => void;
  examinationId: string;
}

const DEFAULT_REALM = 'su.se';

function AddCandidatesToExaminationForm({ cancel, onSubmit, examinationId }: AddCandidatesToExaminationFormProps) {
  const i18n = useI18n();
  const candidateInput = React.useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  const addCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const candidate = candidateInput.current?.value;
    if (!candidate) return;
    const fullCandidate = `${candidate}@${DEFAULT_REALM}`;

    const { response, error } = await PUT(`/api/administration/examination/{examinationId}/candidates`, {
      params: { path: { examinationId } },
      body: { principal: fullCandidate },
    });

    if (response.ok) {
      onSubmit(fullCandidate);
      candidateInput.current.value = '';
    } else if (error) {
      if (response.status >= 500) {
        setError(i18n['Internal server error']);
      } else {
        setError(i18n['Failed to add candidate'](error));
      }
    }
  };

  return (
    <form onSubmit={addCandidate}>
      <div className="input-group mb-3">
        <input ref={candidateInput} type="text" className="form-control" />
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

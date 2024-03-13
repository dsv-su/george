import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../fetch.ts';
import { components, paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';
import useI18n from '../hooks/i18n.ts';
import ManageExaminationProctors from './manageExaminationProctors.tsx';
import ManageExaminationCandidates from './manageExaminationCandidates.tsx';
import { useState } from 'react';
import ExaminationDetailsForm from './examinationDetailsForm.tsx';
import { Feedback, useFeedback } from '../components/feedback.tsx';

const { GET, PUT } = createClient<paths>();
type ExaminationDetails = components['schemas']['ExaminationDetails'];

export default function ExaminationPage() {
  const navigate = useNavigate();
  const { examinationId } = useParams();
  const i18n = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const feedback = useFeedback();

  if (!examinationId) {
    navigate('/administration');
    return <>Invalid examination</>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const examination = useFetch<ExaminationDetails>(
    () =>
      GET(`/api/administration/examination/{examinationId}`, {
        params: { path: { examinationId } },
      }),
    [examinationId],
  );

  const updateExamination = async (data: components['schemas']['NewExaminationRequest']) => {
    feedback.clear();
    const {
      data: updatedExamination,
      error,
      response,
    } = await PUT(`/api/administration/examination/{examinationId}`, {
      body: data,
      params: { path: { examinationId } },
    });

    if (error) {
      if (response.status === 400) {
        feedback.error(i18n['Failed to update examination'](error.detail));
      } else {
        feedback.error(i18n['Internal server error']);
      }
    } else if (updatedExamination) {
      feedback.success(i18n['Examination details updated']);
      examination.setData(updatedExamination);
      setIsEditing(false);
    }
  };

  return (
    <>
      <h1>Examination</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/administration">{i18n['Administration']}</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/administration/examination">{i18n['Examination']}</Link>
          </li>
          <li className="breadcrumb-item active">{examination.data?.title || examinationId}</li>
        </ol>
      </nav>
      <Fetch response={examination}>
        {(data) => {
          if (isEditing) {
            return (
              <>
                <Feedback {...feedback.messages} />
                <ExaminationDetailsForm onSubmit={updateExamination} examinationDetails={data}>
                  <button type="submit" className="btn btn-primary">
                    {i18n['Save changes']}
                  </button>
                  <button type="button" className="btn btn-link" onClick={() => setIsEditing(false)}>
                    {i18n['Cancel']}
                  </button>
                </ExaminationDetailsForm>
              </>
            );
          }
          return (
            <>
              <Feedback {...feedback.messages} />
              <dl>
                <dt>{i18n['Title']()}</dt>
                <dd>{data.title}</dd>

                <dt>{i18n['Date']()}</dt>
                <dd>{data.date}</dd>

                <dt>{i18n['Start']()}</dt>
                <dd>{data.start}</dd>

                <dt>{i18n['End']()}</dt>
                <dd>{data.end}</dd>
              </dl>

              <button
                type="button"
                className="btn btn-link btn-sm"
                onClick={() => {
                  feedback.clear();
                  setIsEditing(true);
                }}
              >
                {i18n['Edit']}
              </button>
            </>
          );
        }}
      </Fetch>

      <h2>{i18n['Proctors']}</h2>
      <ManageExaminationProctors examinationId={examinationId} />

      <h2>{i18n['Candidates']}</h2>
      <ManageExaminationCandidates examinationId={examinationId} />
    </>
  );
}

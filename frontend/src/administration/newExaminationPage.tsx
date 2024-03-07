import createClient from 'openapi-fetch';
import type { components, paths } from '../lib/api/v3';
import useI18n from '../hooks/i18n.ts';
import { Feedback, useFeedback } from '../components/feedback.tsx';
import { Link, useNavigate } from 'react-router-dom';
import ExaminationDetailsForm from './examinationDetailsForm.tsx';

const { POST } = createClient<paths>();
type NewExaminationRequest = components['schemas']['NewExaminationRequest'];

export default function NewExaminationPage() {
  const i18n = useI18n();
  const feedback = useFeedback();
  const navigate = useNavigate();

  const scheduleNewExamination = async (exam: NewExaminationRequest) => {
    const { data, error, response } = await POST('/api/administration/examination', {
      body: exam,
    });

    if (error) {
      if (response.status === 400) {
        feedback.error(i18n['Failed to schedule examination'](error.detail));
      } else {
        feedback.error(i18n['Internal server error']);
      }
    } else if (data) {
      feedback.success(i18n['Examination scheduled']);
      navigate('/administration/examination/' + data.id);
    }
  };

  return (
    <>
      <h2>Schedule new examination</h2>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/administration">{i18n['Administration']}</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/administration/examination">{i18n['Examination']}</Link>
          </li>
          <li className="breadcrumb-item active">{i18n['Schedule new examination']}</li>
        </ol>
      </nav>
      <Feedback {...feedback.messages} />
      <ExaminationDetailsForm onSubmit={scheduleNewExamination}>
        <button type="submit" className="btn btn-primary">
          {i18n.ScheduleExamination()}
        </button>
        <Link to={'/administration/examination'} className="btn btn-link">
          {i18n['Cancel']}
        </Link>
      </ExaminationDetailsForm>
    </>
  );
}

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../fetch.ts';
import { components, paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';
import useI18n from '../hooks/i18n.ts';

const { GET } = createClient<paths>();
type ExaminationDetails = components['schemas']['ExaminationDetails'];

export default function ExaminationPage() {
  const navigate = useNavigate();
  const { examinationId } = useParams();

  if (!examinationId) {
    navigate('/administration');
    return <>Invalid examination</>;
  }

  const examination = useFetch<ExaminationDetails>(
    () =>
      GET(`/api/administration/examination/{examinationId}`, {
        params: { path: { examinationId } },
      }),
    [examinationId],
  );
  const i18n = useI18n();

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
          return (
            <>
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
            </>
          );
        }}
      </Fetch>
    </>
  );
}

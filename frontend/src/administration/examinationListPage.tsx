import { useFetch } from '../fetch.ts';
import { components, paths } from '../lib/api/v3';
import createClient from 'openapi-fetch';
import Fetch from '../components/Fetch.tsx';
import useI18n from '../hooks/i18n.ts';
import { Link } from 'react-router-dom';

const { GET } = createClient<paths>();
type ExaminationDetails = components['schemas']['ExaminationDetails'];

export default function ExaminationListPage() {
  const examinations = useFetch<ExaminationDetails[]>(() => GET('/api/administration/examination'), []);
  const i18n = useI18n();

  return (
    <div>
      <h1>Examination List</h1>
      <nav>
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/administration">{i18n['Administration']}</Link>
          </li>
          <li className="breadcrumb-item active">{i18n['Examination']}</li>
        </ol>
      </nav>
      <Link to="/administration/examination/new">{i18n['Schedule new examination']}</Link>
      <Fetch response={examinations}>
        {(examinations) => {
          return (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>{i18n['Title']()}</th>
                  <th>{i18n['Date']()}</th>
                  <th>{i18n['Start']()}</th>
                  <th>{i18n['End']()}</th>
                </tr>
              </thead>
              <tbody>
                {examinations.map((examination) => {
                  return (
                    <tr key={examination.id}>
                      <td>
                        <Link to={`/administration/examination/${examination.id}`}>{examination.title}</Link>
                      </td>
                      <td>{examination.date}</td>
                      <td>{examination.start}</td>
                      <td>{examination.end}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        }}
      </Fetch>
    </div>
  );
}

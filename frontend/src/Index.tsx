import { useEffect, useState } from 'react';
import { useFetch } from './fetch.ts';
import { Exam } from './proctor.ts';
import { Fetch } from './fetch-dom.ts';
import { Link } from 'react-router-dom';
import createClient from 'openapi-fetch';
import { paths } from './lib/api/v3';

const { GET } = createClient<paths>();

function Index() {
  const [principal, setPrincipal] = useState<string>();

  useEffect(() => {
    async function doFetch() {
      const response = await GET('/api/profile', { parseAs: 'text' });
      const text = response.data;
      setPrincipal(text);
    }
    void doFetch();
  }, []);

  const examsToProctor = useFetch<Exam[]>(() => GET('/api/proctor/list'), []);
  const examsToTake = useFetch(() => GET('/api/candidate/list'), []);

  return (
    <>
      <p>Welcome {principal}</p>
      <h2>Exams to take</h2>
      <Fetch
        response={examsToTake}
        render={(exams) => {
          return (
            <ul>
              {exams.map((exam) => {
                return (
                  <li key={exam.id}>
                    <Link to={`/candidate/${exam.id}`}>{exam.title}</Link>
                  </li>
                );
              })}
            </ul>
          );
        }}
      />

      <h2>Exams to proctor</h2>
      <Fetch
        response={examsToProctor}
        render={(exams) => {
          return (
            <ul>
              {exams.map((exam) => {
                return (
                  <li key={exam.id}>
                    <Link to={`/proctor/${exam.id}`}>{exam.title}</Link>
                  </li>
                );
              })}
            </ul>
          );
        }}
      />

      <Link to="/administration">Administration</Link>
    </>
  );
}

export default Index;

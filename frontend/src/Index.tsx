import { useEffect, useState } from 'react';
import './App.css';
import Api from './api';
import { useFetch } from './fetch.ts';
import { Exam } from './proctor.ts';
import { Fetch } from './fetch-dom.ts';
import { Link } from 'react-router-dom';

function Index() {
  const [principal, setPrincipal] = useState<string>();

  useEffect(() => {
    async function doFetch() {
      const response = await fetch(Api.profile);
      const text = await response.text();
      setPrincipal(text);
    }
    void doFetch();
  }, []);

  const examsToProctor = useFetch<Exam[]>(Api.listMyExamsToProctor);

  return (
    <>
      <p>Welcome {principal}</p>
      <h2>Exams to take</h2>
      <Link to="/candidate/123-abc-456-def">Exam 1</Link>

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
    </>
  );
}

export default Index;

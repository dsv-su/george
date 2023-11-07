import { useEffect, useState } from 'react';

type URI = string;

interface ProblemDetail {
  type: URI;
  title: string;
  status?: number;
  detail?: string;
  instance?: URI;
}

const useFetch = <T>(input: RequestInfo | URL) => {
  const [data, setData] = useState<T>();
  const [problem, setProblem] = useState<ProblemDetail>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const doFetch = async () => {
      const response = await fetch(input);
      try {
        const json = await response.json();
        if (response.ok) {
          setData(json);
        } else {
          setProblem(json);
        }
      } catch (e) {
        console.log('useFetch', input, e);
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error(String(e)));
        }
      }
    };

    void doFetch();
  }, [input]);

  return { data, problem, error };
};

export type { URI, ProblemDetail };
export { useFetch };

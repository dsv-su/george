import { DependencyList, useCallback, useEffect, useState } from 'react';

type URI = string;

interface ProblemDetail {
  type: URI;
  title: string;
  status?: number;
  detail?: string;
  instance?: URI;
}

const useFetch = <T>(request: () => Promise<{ data?: T; error?: unknown }>, deps: DependencyList) => {
  const [data, setData] = useState<T>();
  const [problem, setProblem] = useState<ProblemDetail>();
  const [error, setError] = useState<Error>();

  // we need to use useCallback to avoid infinite loop since the request function is created every render
  // done here instead of at call site to make it nicer to use
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const actualRequest = useCallback(request, deps);

  useEffect(() => {
    const doFetch = async () => {
      try {
        const response = await actualRequest();
        if (response.data) {
          setData(response.data);
        } else {
          setProblem(response.error as ProblemDetail);
        }
      } catch (e) {
        console.log('useFetch', e);
        if (e instanceof Error) {
          setError(e);
        } else {
          setError(new Error(String(e)));
        }
      }
    };

    void doFetch();
  }, [actualRequest]);

  return { data, problem, error };
};

export type { URI, ProblemDetail };
export { useFetch };

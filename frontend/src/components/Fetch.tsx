import { ProblemDetail } from '../fetch.ts';
import React from 'react';

type Fetch<T> = { data?: T; error?: Error; problem?: ProblemDetail };

export default function Fetch<T>({
  response: { data, error, problem },
  children,
}: {
  response: Fetch<T>;
  children: (data: T) => React.JSX.Element;
}) {
  if (!data && !error && !problem) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (problem) {
    return <p>Problem: {problem.detail}</p>;
  }

  return data && children(data);
}

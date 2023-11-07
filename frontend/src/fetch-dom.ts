import { ProblemDetail } from './fetch.ts';

const Fetch = <T, A>({
  response: { data, problem, error },
  render,
}: {
  response: { data?: T; problem?: ProblemDetail; error?: Error };
  render: (data: T) => A;
}) => {
  if (error) {
    return 'Error!';
  } else if (problem) {
    return `${problem.title}: ${problem.detail}`;
  } else if (data) {
    return render(data);
  } else {
    return 'Loading ...';
  }
};

export { Fetch };

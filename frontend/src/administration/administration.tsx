import createClient from 'openapi-fetch';
import { components, paths } from '../lib/api/v3';
import { z } from 'zod';
import { useZorm } from 'react-zorm';

const { POST } = createClient<paths>();

const ExaminationSchema = z
  .object({
    title: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fill in a date in format 'YYYY-MM-DD'"),
    start: z.string(),
    end: z.string(),
  })
  .required();

export default function Administration() {
  const zo = useZorm('schedule_new_examination', ExaminationSchema, {
    onValidSubmit: async (e) => {
      console.log(e);
      e.preventDefault();
    },
  });

  const scheduleNewExamination = async (exam: components['schemas']['NewExaminationRequest']) => {
    const response = await POST('/api/administration/examination', {
      body: exam,
    });

    if (response.error) {
      console.error(response.error);
      return 'Error!';
    }
  };

  return (
    <>
      <h2>Schedule new examination</h2>
      <form ref={zo.ref}>
        <input type="text" name={zo.fields.title()} />
        {zo.errors.title((e) => (
          <p>{e.message}</p>
        ))}
        <input type="date" name={zo.fields.date()} />
        {zo.errors.date((e) => (
          <p>{e.message}</p>
        ))}
        <input type="time" name={zo.fields.start()} />
        <input type="time" name={zo.fields.end()} />

        <button type="submit">Schedule</button>
      </form>
    </>
  );
}

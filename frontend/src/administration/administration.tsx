import createClient from 'openapi-fetch';
import type { components, paths } from '../lib/api/v3';
import { z } from 'zod';
import { useZorm } from 'react-zorm';
import useI18n from '../hooks/i18n.ts';
import { input } from '../components/input.tsx';
import { Feedback, useFeedback } from '../components/feedback.tsx';

const { POST } = createClient<paths>();
type NewExaminationRequest = components['schemas']['NewExaminationRequest'];

const ExaminationSchema = z
  .object({
    title: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .required();

export default function Administration() {
  const zo = useZorm('schedule_new_examination', ExaminationSchema, {
    onValidSubmit: async (e) => {
      e.preventDefault();
      await scheduleNewExamination(e.data);
    },
  });
  const i18n = useI18n();
  const feedback = useFeedback();

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
    }
  };

  return (
    <>
      <h2>Schedule new examination</h2>
      <Feedback {...feedback.messages} />
      <form ref={zo.ref}>
        {zo.fields.title(input('text', i18n.Title(), i18n.badTitle))}
        {zo.fields.date(input('date', i18n.Date(), i18n.badDate))}
        {zo.fields.start(input('time', i18n.Start(), i18n.badStart))}
        {zo.fields.end(input('time', i18n.End(), i18n.badEnd))}

        <button type="submit">{i18n.ScheduleExamination()}</button>
      </form>
    </>
  );
}

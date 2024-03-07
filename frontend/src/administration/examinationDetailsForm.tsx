import { useZorm } from 'react-zorm';
import { z } from 'zod';
import type { components } from '../lib/api/v3';
import { input } from '../components/input.tsx';
import useI18n from '../hooks/i18n.ts';
import { PropsWithChildren } from 'react';

type ExaminationDetails = components['schemas']['NewExaminationRequest'];

const ExaminationSchema = z
  .object({
    title: z.string().min(10),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
    end: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  })
  .required();

type ExaminationDetailsFormProps = {
  onSubmit: (data: ExaminationDetails) => void | Promise<void>;
  examinationDetails?: ExaminationDetails;
};
export default function ExaminationDetailsForm({ onSubmit, examinationDetails, children }: PropsWithChildren<ExaminationDetailsFormProps>) {
  const zo = useZorm('schedule_new_examination', ExaminationSchema, {
    onValidSubmit: async (e) => {
      e.preventDefault();
      await onSubmit(e.data);
    },
  });
  const i18n = useI18n();

  return (
    <form ref={zo.ref}>
      {zo.fields.title(input('text', i18n.Title(), i18n.badTitle, examinationDetails?.title))}
      {zo.fields.date(input('date', i18n.Date(), i18n.badDate, examinationDetails?.date))}
      {zo.fields.start(input('time', i18n.Start(), i18n.badStart, examinationDetails?.start))}
      {zo.fields.end(input('time', i18n.End(), i18n.badEnd, examinationDetails?.end))}

      {children}
    </form>
  );
}

import { ZodIssue } from 'zod';
import { createContext, useContext } from 'react';

const ENGLISH = {
  Title() {
    return 'Title';
  },
  badTitle(issue: ZodIssue) {
    switch (issue.code) {
      case 'too_small':
        return `Title must be at least ${issue.minimum} characters long`;
      default:
        return issue.message;
    }
  },
  Date() {
    return 'Date';
  },
  badDate(issue: ZodIssue) {
    switch (issue.code) {
      case 'invalid_string':
        return 'Fill in a date in format YYYY-MM-DD';
      default:
        return issue.message;
    }
  },

  Start() {
    return 'Start time';
  },
  badStart(issue: ZodIssue) {
    switch (issue.code) {
      case 'invalid_string':
        return 'Fill in a time in format HH:MM';
      default:
        return issue.message;
    }
  },

  End() {
    return 'End time';
  },
  badEnd(issue: ZodIssue) {
    switch (issue.code) {
      case 'invalid_string':
        return 'Fill in a time in format HH:MM';
      default:
        return issue.message;
    }
  },

  ScheduleExamination() {
    return 'Schedule examination';
  },
  'Failed to schedule examination': function (reason?: string) {
    if (reason) {
      return 'Could not schedule examination: ' + reason;
    } else {
      return 'Could not schedule examination';
    }
  },
  'Internal server error': 'Unfortunately something went wrong, try again later.',
  'Examination scheduled': 'Examination scheduled',
};

const SWEDISH: typeof ENGLISH = {
  Title(): string {
    throw new Error('Function not implemented.');
  },
  badTitle(): string {
    throw new Error('Function not implemented.');
  },
  Date: function (): string {
    throw new Error('Function not implemented.');
  },
  badDate: function (): string {
    throw new Error('Function not implemented.');
  },
  Start: function (): string {
    throw new Error('Function not implemented.');
  },
  badStart: function (): string {
    throw new Error('Function not implemented.');
  },
  End: function (): string {
    throw new Error('Function not implemented.');
  },
  badEnd: function (): string {
    throw new Error('Function not implemented.');
  },
  ScheduleExamination: function (): string {
    throw new Error('Function not implemented.');
  },
  'Failed to schedule examination': function (reason?: string) {
    if (reason) {
      return 'Kan inte schemalägga examination: ' + reason;
    } else {
      return 'Kan inte schemalägga examination';
    }
  },
  'Internal server error': 'Tyvärr gick något fel, försök igen senare',
  'Examination scheduled': 'Examination schemalagd',
};

type Language = 'en' | 'sv';
const Language = createContext<Language>('en');

export default function useI18n() {
  const selectedLanguage = useContext(Language);
  switch (selectedLanguage) {
    case 'en':
      return ENGLISH;
    case 'sv':
      return SWEDISH;
  }
}
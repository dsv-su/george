import React from 'react';
import { z } from 'zod';
import Zorm from 'react-zorm';

export function input(
  type: React.HTMLInputTypeAttribute,
  label: string,
  errorI18n: (e: z.ZodIssue) => string,
  defaultValue?: string,
): (props: Zorm.RenderProps) => React.JSX.Element {
  return (props: Zorm.RenderProps) => {
    return (
      <div className="mb-3">
        <label htmlFor={props.id} className="form-label">
          {label}
        </label>
        <input type={type} name={props.name} id={props.id} className="form-control" defaultValue={defaultValue} />
        {props.issues.map((issue) => {
          return (
            <div key={issue.code} className="form-text text-danger">
              {errorI18n(issue)}
            </div>
          );
        })}
      </div>
    );
  };
}

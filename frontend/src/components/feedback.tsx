import { useState } from 'react';

export type Functions = {
  success: (message: string) => void;
  error: (message: string) => void;
  clear: () => void;
};

export type Messages = {
  success: string[];
  error: string[];
};

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedback(): Functions & { messages: Messages } {
  const [messages, setMessages] = useState<Messages>({ success: [], error: [] });

  return {
    success: (message: string) => {
      setMessages((messages) => {
        return { ...messages, success: [...messages.success, message] };
      });
    },
    error: (message: string) => {
      setMessages((messages) => {
        return { ...messages, error: [...messages.error, message] };
      });
    },
    clear: () => {
      setMessages({ success: [], error: [] });
    },
    messages: messages,
  };
}

export function Feedback({ success, error }: Messages) {
  return (
    <>
      {success.length > 0 && (
        <div className="alert alert-success mb-3">
          <ul className="list-unstyled mb-0">
            {success.map((message) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )}
      {error.length > 0 && (
        <div className="alert alert-danger mb-3">
          <ul className="list-unstyled mb-0">
            {error.map((message) => {
              return <li key={message}>{message}</li>;
            })}
          </ul>
        </div>
      )}
    </>
  );
}

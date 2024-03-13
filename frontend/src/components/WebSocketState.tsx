import { ReadyState } from 'react-use-websocket';

export function WebSocketState({ readyState }: { readyState: ReadyState }) {
  switch (readyState) {
    case ReadyState.CONNECTING:
      return <span className="badge bg-info">Connecting to system ...</span>;
    case ReadyState.OPEN:
      return <span className="badge bg-success">System connected</span>;
    default:
      return <span className="badge bg-danger">System disconnected</span>;
  }
}

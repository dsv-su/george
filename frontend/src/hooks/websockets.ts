import useWebSocket, { Options } from 'react-use-websocket';
import { DEFAULT_OPTIONS } from 'react-use-websocket/dist/lib/constants';

export function useProctorWebsocket(options: Options = DEFAULT_OPTIONS) {
  const origin = window.location.origin.replace('http', 'ws');

  const opts: Options = {
    ...options,
    share: true,
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
  };

  return useWebSocket(`${origin}/ws/proctor`, opts);
}

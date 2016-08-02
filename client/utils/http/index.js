import axios from 'axios';

const clients = {};

export default base => {
  if (clients[base]) return clients[base];
  const restClient = axios.create({
    baseURL: `${typeof window !== 'undefined'
      ? window.location.origin
      : `${HOST}:${PORT}`}${REST_API_PATH}/${base}`,
    responseType: 'json',
  });
  clients[base] = restClient;

  return Object.assign(restClient, {
    read: restClient.get,
    create: restClient.post,
    update: restClient.put,
  });
};

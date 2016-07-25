import axios from 'axios';

export default base => {
  const restClient = axios.create({
    baseURL: `${typeof window !== 'undefined'
      ? window.location.origin
      : `${HOST}:${PORT}`}${REST_API_PATH}/${base}`,
    responseType: 'json',
  });

  return Object.assign(restClient, {
    read: restClient.get,
    create: restClient.post,
    update: restClient.put,
  });
};

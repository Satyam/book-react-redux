import axios from 'axios';

const PORT = process.env.npm_package_myWebServer_port || 8080;
const HOST = process.env.npm_package_myWebServer_host || 'http://localhost';

export default base => {
  const restClient = axios.create({
    baseURL: `${typeof window !== 'undefined'
      ? window.location.origin
      : `${HOST}:${PORT}`}/${base}`,
    responseType: 'json',
  });
  return Object.assign(restClient, {
    read: restClient.get,
    create: restClient.post,
    update: restClient.put,
  });
};

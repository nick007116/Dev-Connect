const configuredBackendUrl = process.env.REACT_APP_BACKEND_URL?.trim();

export const getBackendUrl = () => {
  if (configuredBackendUrl) {
    return configuredBackendUrl.replace(/\/+$/, '');
  }

  return process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : null;
};

export const getSocketUrl = () => (
  process.env.REACT_APP_SOCKET_URL?.trim().replace(/\/+$/, '') || getBackendUrl()
);

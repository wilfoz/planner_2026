export const environment = {
  production: false,
  apiUrl: '/api', // Use proxy
  mapboxToken: 'pk.eyJ1Ijoid2lsZXJzb24iLCJhIjoiY2xhMms1bXB5MDBlZjN2cngybWNlcG8xMyJ9.sMcHdDfogSHF9TFzvN_qQA', // Actual token
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'lt-budget-realm',
    clientId: 'lt-budget-angular',
  },
};

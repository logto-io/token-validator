import { conditional } from '@silverhand/essentials';

import { LogtoError } from './errors';

type AuthenticationResult = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

const parseCallbackUri = (url: string): AuthenticationResult => {
  const [, queryString = ''] = url.split('?');
  const urlSearchParameters = new URLSearchParams(queryString);

  return {
    code: conditional(urlSearchParameters.get('code')),
    state: conditional(urlSearchParameters.get('state')),
    error: conditional(urlSearchParameters.get('error')),
    error_description: conditional(urlSearchParameters.get('error_description')),
  };
};

export const verifyAndParseCodeFromCallbackUri = (
  callbackUri: string,
  redirectUri: string,
  state: string
) => {
  if (!callbackUri.startsWith(redirectUri)) {
    throw new LogtoError('callback_uri_verification.redirect_uri_mismatched');
  }

  const authenticationResult = parseCallbackUri(callbackUri);
  const {
    code,
    state: stateFromCallbackUri,
    error,
    error_description: errorDescription,
  } = authenticationResult;

  if (error) {
    throw new LogtoError('callback_uri_verification.error_found', { error, errorDescription });
  }

  if (!stateFromCallbackUri) {
    throw new LogtoError('callback_uri_verification.missing_state');
  }

  if (stateFromCallbackUri !== state) {
    throw new LogtoError('callback_uri_verification.state_mismatched');
  }

  if (!code) {
    throw new LogtoError('callback_uri_verification.missing_code');
  }

  return code;
};

import request from 'superagent';
import {getAuthTokens} from './storage';

// TODO: remove this if we no longer need it
const API_BASE_URL = ''; // 'http://localhost:4000';

// TODO: handle this on the server instead
function now() {
  const date = new Date();

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export type LoginParams = {
  email: string;
  password: string;
};

export type RegisterParams = LoginParams & {
  companyName?: string;
  inviteToken?: string;
  passwordConfirmation: string;
};

const getAccessToken = (): string | null => {
  const tokens = getAuthTokens();

  return (tokens && tokens.token) || null;
};

const getRefreshToken = (): string | null => {
  const tokens = getAuthTokens();

  return (tokens && tokens.renew_token) || null;
};

export const me = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/me`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const login = async ({email, password}: LoginParams) => {
  return request
    .post(`${API_BASE_URL}/api/session`)
    .send({user: {email, password}})
    .then((res) => res.body.data);
};

export const logout = async () => {
  return request.delete(`${API_BASE_URL}/api/session`).then((res) => res.body);
};

export const register = async ({
  companyName,
  inviteToken,
  email,
  password,
  passwordConfirmation,
}: RegisterParams) => {
  return request
    .post(`${API_BASE_URL}/api/registration`)
    .send({
      user: {
        company_name: companyName,
        invite_token: inviteToken,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    })
    .then((res) => res.body.data);
};

export const renew = async (token = getRefreshToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .post(`${API_BASE_URL}/api/session/renew`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const createNewCustomer = async (accountId: string) => {
  return request
    .post(`${API_BASE_URL}/api/customers`)
    .send({
      customer: {
        account_id: accountId,
        first_seen: now(),
        last_seen: now(),
      },
    }) // TODO: send over some metadata?
    .then((res) => res.body.data);
};

export const createNewConversation = async (
  accountId: string,
  customerId: string
) => {
  return request
    .post(`${API_BASE_URL}/api/conversations`)
    .send({
      conversation: {
        account_id: accountId,
        customer_id: customerId,
      },
    })
    .then((res) => res.body.data);
};

export const fetchAccountInfo = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/accounts/me`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const fetchAllConversations = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/conversations`)
    .query({status: 'open'})
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const fetchMyConversations = async (
  userId: number,
  token = getAccessToken()
) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/conversations`)
    .query({assignee_id: userId})
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const fetchPriorityConversations = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/conversations`)
    .query({priority: 'priority'})
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const fetchClosedConversations = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/conversations`)
    .query({status: 'closed'})
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const updateConversation = async (
  conversationId: string,
  updates: any,
  token = getAccessToken()
) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .put(`${API_BASE_URL}/api/conversations/${conversationId}`)
    .set('Authorization', token)
    .send(updates)
    .then((res) => res.body.data);
};

// TODO: deprecate, messages should only be fetched by conversation
export const fetchMessages = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/messages`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const countMessages = async (token = getAccessToken()) => {
  if (!token) {
    throw new Error('Invalid token!');
  }

  return request
    .get(`${API_BASE_URL}/api/messages/count`)
    .set('Authorization', token)
    .then((res) => res.body.data);
};

export const fetchCustomerConversations = async (
  customerId: string,
  accountId: string
) => {
  return request
    .get(`${API_BASE_URL}/api/conversations/customer`)
    .query({customer_id: customerId, account_id: accountId})
    .then((res) => res.body.data);
};
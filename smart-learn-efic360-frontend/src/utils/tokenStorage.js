// src/utils/tokenStorage.js

const TOKEN_KEY = 'smartLearnToken';

/**
 * Save JWT token to localStorage
 * @param {string} token
 */
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve JWT token from localStorage
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

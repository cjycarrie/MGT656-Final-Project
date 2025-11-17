/*
trackly-api.js
Simple helper functions to integrate with the Trackly backend.
BASE is kept as the provided backend URL per your request.
Pagination: `fetchFriendsPosts(page, pageSize)` supports page param (defaults: page=1, pageSize=20).
CSRF: tries cookie first, then calls /csrf/ to set cookie; backend will include your origin in CORS.
*/

const BASE = 'https://trackly-3smc.onrender.com';

function getCookie(name) {
  const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

export async function getCsrfToken() {
  await fetch(`${BASE}/csrf/`, {
    method: 'GET',
    credentials: 'include',
    mode: 'cors'
  });
  const token = getCookie('csrftoken');
  return token; // may be null if cookie not readable by this origin
}

export async function login(username, password) {
  let token = getCookie('csrftoken');
  if (!token) token = await getCsrfToken();
  const res = await fetch(`${BASE}/login/`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token || '',
      'Referer': window.location.origin
    },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed ${res.status}: ${text}`);
  }
  return res.json();
}

// fetchFriendsPosts supports pagination. Assumes backend returns paginated JSON
// with either { results: [...], next, previous, count } or an array. We normalize.
export async function fetchFriendsPosts(page = 1, pageSize = 20) {
  const url = new URL(`${BASE}/posts/friends/`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    mode: 'cors',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error(`Fetch feed failed ${res.status}`);
  const data = await res.json();
  // Normalize: if array returned, wrap
  if (Array.isArray(data)) return { results: data, next: null, previous: null, count: data.length };
  return data;
}

export async function createPost(title, body) {
  let token = getCookie('csrftoken');
  if (!token) token = await getCsrfToken();
  const res = await fetch(`${BASE}/posts/`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token || '',
      'Referer': window.location.origin
    },
    body: JSON.stringify({ title, body })
  });
  const ct = res.headers.get('Content-Type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(`Create post failed ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function likePost(postId) {
  let token = getCookie('csrftoken');
  if (!token) token = await getCsrfToken();
  const res = await fetch(`${BASE}/posts/${postId}/like/`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token || '',
      'Referer': window.location.origin
    }
  });
  const ct = res.headers.get('Content-Type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(`Like failed ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

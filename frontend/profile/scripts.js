
import * as Trackly from '../trackly-api.js';

let user = JSON.parse(localStorage.getItem('user') || 'null');

// If user not present or missing username (session login may have stored only a status),
// try to fetch current user info from the server (same-origin session).
async function ensureUser() {
  if (user && user.username) return user;
  try {
    const res = await fetch(window.TRACKLY_API_BASE + '/me/', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        user = data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
    }
  } catch (e) {
    // ignore
  }
  // Not authenticated client-side: redirect to login
  window.location.href = '../login/index.html';
}

(async ()=>{ await ensureUser(); })();

// UI elements
const nameEl = document.getElementById('name');
const usernameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const postForm = document.getElementById('post-form');
const postBtn = document.getElementById('postBtn');
const feedEl = document.getElementById('feed');

nameEl.innerText = user.name || '(unknown)';
usernameEl.innerText = user.username || '';
emailEl.innerText = user.email || '';

let page = 1;
const pageSize = 20;

function escapeHtml(s=''){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function formatTime(iso){ try { return new Date(iso).toLocaleString(); } catch(e){ return iso; } }

function renderPost(post){
  const div = document.createElement('div');
  div.className = 'post-item p-3 border rounded bg-white';
  div.dataset.id = post.id;
  const liked = !!post.liked_by_me;
  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <div class="text-sm font-semibold">${escapeHtml(post.author_username || 'User')}</div>
      <div class="text-xs text-gray-500">${formatTime(post.created_at)}</div>
    </div>
    <div class="mb-2"><strong>${escapeHtml(post.song_title || '')}</strong> — ${escapeHtml(post.artist_name || '')}</div>
    <div class="mb-2 text-gray-700">${escapeHtml(post.caption || '')}</div>
    <div class="flex items-center">
      <button class="like-btn mr-2 px-3 py-1 rounded ${liked? 'bg-red-100 text-red-600':'bg-gray-100'}">❤ <span class="likes-count ml-1">${post.likes_count||0}</span></button>
    </div>
  `;
  const likeBtn = div.querySelector('.like-btn');
  likeBtn.addEventListener('click', () => handleLike(post, div));
  return div;
}

async function loadFeed(){
  try{
    const data = await Trackly.fetchFriendsPosts(page, pageSize);
    const list = data.results || data;
    if (!list || list.length === 0) return;
    list.forEach(p => feedEl.appendChild(renderPost(p)));
    page += 1;
  } catch (err){
    console.error('Failed to load feed', err);
  }
}

async function handleLike(post, el){
  const likeBtn = el.querySelector('.like-btn');
  const countEl = el.querySelector('.likes-count');
  const prevLiked = !!post.liked_by_me;
  const prevCount = Number(post.likes_count || 0);
  // optimistic
  post.liked_by_me = !prevLiked;
  post.likes_count = prevLiked ? Math.max(0, prevCount-1) : prevCount+1;
  likeBtn.innerHTML = `❤ <span class="likes-count ml-1">${post.likes_count}</span>`;
  try{
    const res = await Trackly.likePost(post.id);
    if (res && typeof res.likes_count !== 'undefined'){
      post.likes_count = res.likes_count;
      post.liked_by_me = !!res.liked;
      countEl.textContent = String(post.likes_count);
    }
  } catch (err){
    console.error('Like failed', err);
    post.liked_by_me = prevLiked;
    post.likes_count = prevCount;
    likeBtn.innerHTML = `❤ <span class="likes-count ml-1">${post.likes_count}</span>`;
    alert('Failed to like post.');
  }
}

postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const song_title = document.getElementById('song_title').value.trim();
  const artist_name = document.getElementById('artist_name').value.trim();
  const spotify_url = document.getElementById('spotify_url').value.trim() || null;
  const caption = document.getElementById('caption').value.trim() || '';
  postBtn.disabled = true; postBtn.textContent = 'Posting...';
  try{
    const created = await Trackly.createPost(song_title || null, artist_name || '', spotify_url, caption);
    // created may be {id, post_date} or full post; try to fetch latest feed instead of assuming created content
    // prepend simple entry
    const item = renderPost(Object.assign({
      id: created.id || Math.random()*100000,
      author_username: user.username,
      song_title: song_title,
      artist_name: artist_name,
      spotify_url: spotify_url,
      caption: caption,
      created_at: new Date().toISOString(),
      post_date: (new Date()).toISOString().slice(0,10),
      likes_count: 0,
      liked_by_me: false
    }, created));
    feedEl.insertBefore(item, feedEl.firstChild);
    postForm.reset();
  } catch (err){
    console.error('Post failed', err);
    alert('Failed to create post.');
  } finally{
    postBtn.disabled = false; postBtn.textContent = 'Post';
  }
});

// initial load
loadFeed();


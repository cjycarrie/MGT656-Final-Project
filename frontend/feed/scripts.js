import * as Trackly from '../trackly-api.js';

const feedEl = document.getElementById('feed');
const loadMoreBtn = document.getElementById('load-more');
const postBtn = document.getElementById('post-btn');
const titleInput = document.getElementById('post-title');
const bodyInput = document.getElementById('post-body');
const composerMsg = document.getElementById('composer-msg');
const feedMsg = document.getElementById('feed-msg');

let page = 1;
const pageSize = 10;
let loading = false;

function formatTime(iso) {
  try { return new Date(iso).toLocaleString(); } catch(e){ return iso; }
}

function renderPost(post) {
  const div = document.createElement('div');
  div.className = 'post';
  div.dataset.id = post.id;
  const liked = !!post.liked_by_me;
  div.innerHTML = `
    <div class="meta">
      <div class="author">${post.author_username || post.author?.display_name || post.author?.username || 'User'}</div>
      <div class="time">${formatTime(post.created_at)}</div>
    </div>
    <div class="body">${post.song_title ? `<strong>${escapeHtml(post.song_title)}</strong> — ${escapeHtml(post.artist_name || '')}<br/>` : ''}${escapeHtml(post.caption || '')}</div>
    <div class="actions">
      <button class="like-btn mr-2 px-3 py-1 rounded bg-gray-100 text-gray-700" style="display: ${liked ? 'none' : 'inline-block'}">❤ <span class="likes-count">${post.likes_count || 0}</span> Like</button>
      <button class="unlike-btn mr-2 px-3 py-1 rounded bg-red-100 text-red-600" style="display: ${liked ? 'inline-block' : 'none'}">❤ <span class="likes-count">${post.likes_count || 0}</span> Unlike</button>
    </div>
  `;
  const likeBtn = div.querySelector('.like-btn');
  const unlikeBtn = div.querySelector('.unlike-btn');
  likeBtn.addEventListener('click', () => handleLike(post, div));
  unlikeBtn.addEventListener('click', () => handleUnlike(post, div));
  return div;
}

function escapeHtml(s=''){
  return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

async function loadPosts() {
  if (loading) return;
  loading = true; feedMsg.textContent = 'Loading...'; loadMoreBtn.disabled = true;
  try {
    const data = await Trackly.fetchFriendsPosts(page, pageSize);
    const list = data.results || data;
    if (!list || list.length === 0) {
      feedMsg.textContent = page === 1 ? 'No posts yet.' : 'No more posts.';
      loadMoreBtn.disabled = true;
    } else {
      list.forEach(p => feedEl.appendChild(renderPost(p)));
      feedMsg.textContent = '';
      if (data.next) { loadMoreBtn.disabled = false; }
      else { loadMoreBtn.disabled = list.length < pageSize; }
      page += 1;
    }
  } catch (err) {
    console.error(err);
    feedMsg.textContent = 'Failed to load feed.';
  } finally { loading = false; }
}

async function handleLike(post, postEl) {
  const likeBtn = postEl.querySelector('.like-btn');
  const unlikeBtn = postEl.querySelector('.unlike-btn');
  const countEl = postEl.querySelector('.likes-count');
  const prevLiked = !!post.liked_by_me;
  const prevCount = Number(post.likes_count || 0);
  // Optimistic update: show liked state
  post.liked_by_me = true;
  post.likes_count = prevCount + 1;
  likeBtn.style.display = 'none';
  unlikeBtn.style.display = 'inline-block';
  countEl.textContent = String(post.likes_count);
  try {
    const res = await Trackly.likePost(post.id, null);
    if (res && typeof res.likes_count !== 'undefined') {
      post.likes_count = res.likes_count;
      post.liked_by_me = !!res.liked;
      countEl.textContent = String(post.likes_count);
      likeBtn.style.display = post.liked_by_me ? 'none' : 'inline-block';
      unlikeBtn.style.display = post.liked_by_me ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Like failed', err);
    // Revert optimistic UI on error
    post.liked_by_me = prevLiked;
    post.likes_count = prevCount;
    likeBtn.style.display = prevLiked ? 'none' : 'inline-block';
    unlikeBtn.style.display = prevLiked ? 'inline-block' : 'none';
    countEl.textContent = String(post.likes_count);
    alert('Failed to like post.');
  }
}

async function handleUnlike(post, postEl) {
  const likeBtn = postEl.querySelector('.like-btn');
  const unlikeBtn = postEl.querySelector('.unlike-btn');
  const countEl = postEl.querySelector('.likes-count');
  const prevLiked = !!post.liked_by_me;
  const prevCount = Number(post.likes_count || 0);
  // Optimistic update: show unliked state
  post.liked_by_me = false;
  post.likes_count = Math.max(0, prevCount - 1);
  likeBtn.style.display = 'inline-block';
  unlikeBtn.style.display = 'none';
  countEl.textContent = String(post.likes_count);
  try {
    const res = await Trackly.likePost(post.id, 'unlike');
    if (res && typeof res.likes_count !== 'undefined') {
      post.likes_count = res.likes_count;
      post.liked_by_me = !!res.liked;
      countEl.textContent = String(post.likes_count);
      likeBtn.style.display = post.liked_by_me ? 'none' : 'inline-block';
      unlikeBtn.style.display = post.liked_by_me ? 'inline-block' : 'none';
    }
  } catch (err) {
    console.error('Unlike failed', err);
    // revert
    post.liked_by_me = prevLiked;
    post.likes_count = prevCount;
    likeBtn.style.display = prevLiked ? 'none' : 'inline-block';
    unlikeBtn.style.display = prevLiked ? 'inline-block' : 'none';
    countEl.textContent = String(post.likes_count);
    alert('Failed to unlike post.');
  }
}

postBtn.addEventListener('click', async () => {
  composerMsg.textContent = '';
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!body) { composerMsg.textContent = 'Please write something.'; return; }
  postBtn.disabled = true; postBtn.textContent = 'Posting...';
  try {
    const created = await Trackly.createPost(title || null, '', null, body);
    feedEl.insertBefore(renderPost(created), feedEl.firstChild);
    titleInput.value = '';
    bodyInput.value = '';
  } catch (err) {
    console.error(err);
    composerMsg.textContent = 'Failed to post.';
  } finally {
    postBtn.disabled = false; postBtn.textContent = 'Post';
  }
});

loadMoreBtn.addEventListener('click', loadPosts);
loadPosts();

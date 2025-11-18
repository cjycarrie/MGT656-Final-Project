import * as Trackly from '../trackly-api.js';

// Ensure user exists via session or token
let user = JSON.parse(localStorage.getItem('user') || 'null');
async function ensureUser(){
  if (user && user.username) return user;
  try{
    const res = await fetch(window.TRACKLY_API_BASE + '/me/', { credentials: 'include' });
    if (res.ok){ const data = await res.json(); user = data.user; localStorage.setItem('user', JSON.stringify(user)); return user; }
  }catch(e){}
  window.location.href = '../login/index.html';
}

const form = document.getElementById('post-form');
const postBtn = document.getElementById('postBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await ensureUser();
  const song_title = document.getElementById('song_title').value.trim();
  const artist_name = document.getElementById('artist_name').value.trim();
  const spotify_url = document.getElementById('spotify_url').value.trim() || null;
  const caption = document.getElementById('caption').value.trim() || '';
  postBtn.disabled = true; postBtn.textContent = 'Posting...';
  try{
    const created = await Trackly.createPost(song_title || null, artist_name || '', spotify_url, caption);
    alert('Posted successfully');
    form.reset();
    // After posting go to feed
    window.location.href = '../feed/index.html';
  } catch (err) {
    console.error(err);
    alert('Failed to create post');
  } finally {
    postBtn.disabled = false; postBtn.textContent = 'Post';
  }
});

// Try to ensure user on load
ensureUser();

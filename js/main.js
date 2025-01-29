import { initializeGitHub, getPosts, createPost, updatePost, deletePost } from './github.js';
import { renderHome, renderEditor, renderPost } from './ui.js';
import { setupSearch } from './search.js';
import { setupComments } from './comments.js';

const content = document.getElementById('content');
const homeLink = document.getElementById('homeLink');
const newPostLink = document.getElementById('newPostLink');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

let currentPost = null;

async function init() {
    await initializeGitHub();
    setupEventListeners();
    renderHome();
    setupSearch(searchInput, searchButton, renderSearchResults);
}

function setupEventListeners() {
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderHome();
    });

    newPostLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderEditor();
    });

    content.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-post')) {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            currentPost = await getPosts(postId);
            renderEditor(currentPost);
        } else if (e.target.classList.contains('delete-post')) {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            if (confirm('Are you sure you want to delete this post?')) {
                await deletePost(postId);
                renderHome();
            }
        } else if (e.target.classList.contains('view-post')) {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            currentPost = await getPosts(postId);
            renderPost(currentPost);
        }
    });

    content.addEventListener('submit', async (e) => {
        if (e.target.id === 'postForm') {
            e.preventDefault();
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            if (currentPost) {
                await updatePost(currentPost.id, title, content);
            } else {
                await createPost(title, content);
            }
            renderHome();
        }
    });
}

function renderSearchResults(results) {
    content.innerHTML = `
        <h2>Search Results</h2>
        <ul class="list-group">
            ${results.map(post => `
                <li class="list-group-item">
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 100)}...</p>
                    <a href="#" class="btn btn-primary view-post" data-post-id="${post.id}">View</a>
                    <a href="#" class="btn btn-secondary edit-post" data-post-id="${post.id}">Edit</a>
                    <a href="#" class="btn btn-danger delete-post" data-post-id="${post.id}">Delete</a>
                </li>
            `).join('')}
        </ul>
    `;
}

init();
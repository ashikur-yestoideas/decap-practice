import { getPosts } from './github.js';
import { setupComments } from './comments.js';
import EasyMDE from 'easymde'; // Import EasyMDE

const content = document.getElementById('content');
let editor;

export async function renderHome() {
    const posts = await getPosts();
    content.innerHTML = `
        <h1>Recent Posts</h1>
        <ul class="list-group">
            ${posts.map(post => `
                <li class="list-group-item">
                    <h2>${post.title}</h2>
                    <p>${post.content.substring(0, 100)}...</p>
                    <a href="#" class="btn btn-primary view-post" data-post-id="${post.id}">View</a>
                    <a href="#" class="btn btn-secondary edit-post" data-post-id="${post.id}">Edit</a>
                    <a href="#" class="btn btn-danger delete-post" data-post-id="${post.id}">Delete</a>
                </li>
            `).join('')}
        </ul>
    `;
}

export function renderEditor(post = null) {
    content.innerHTML = `
        <h1>${post ? 'Edit Post' : 'New Post'}</h1>
        <form id="postForm">
            <div class="mb-3">
                <label for="postTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="postTitle" value="${post ? post.title : ''}" required>
            </div>
            <div class="mb-3">
                <label for="postContent" class="form-label">Content</label>
                <textarea class="form-control" id="postContent" rows="10" required>${post ? post.content : ''}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">${post ? 'Update' : 'Create'} Post</button>
        </form>
    `;

    editor = new EasyMDE({ element: document.getElementById('postContent') });
}

export async function renderPost(post) {
    content.innerHTML = `
        <h1>${post.title}</h1>
        <div class="post-content">${marked(post.content)}</div>
        <hr>
        <h3>Comments</h3>
        <div id="comments"></div>
        <form id="commentForm">
            <div class="mb-3">
                <label for="commentAuthor" class="form-label">Name</label>
                <input type="text" class="form-control" id="commentAuthor" required>
            </div>
            <div class="mb-3">
                <label for="commentContent" class="form-label">Comment</label>
                <textarea class="form-control" id="commentContent" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Add Comment</button>
        </form>
    `;

    setupComments(post.id);
}
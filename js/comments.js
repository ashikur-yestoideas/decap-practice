import { octokit, REPO_OWNER, REPO_NAME } from './github.js';

const COMMENTS_PATH = 'comments';

export function setupComments(postId) {
    const commentForm = document.getElementById('commentForm');
    const commentsContainer = document.getElementById('comments');

    loadComments(postId, commentsContainer);

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('commentAuthor').value;
        const content = document.getElementById('commentContent').value;
        await addComment(postId, author, content);
        loadComments(postId, commentsContainer);
        commentForm.reset();
    });
}

async function loadComments(postId, container) {
    try {
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${COMMENTS_PATH}/${postId}.json`,
        });
        const comments = JSON.parse(atob(response.data.content));
        renderComments(comments, container);
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = '<p>No comments found.</p>';
    }
}

function renderComments(comments, container) {
    container.innerHTML = comments.map(comment => `
        <div class="comment">
            <h4>${comment.author}</h4>
            <p>${comment.content}</p>
            <small>${new Date(comment.date).toLocaleString()}</small>
        </div>
    `).join('');
}

async function addComment(postId, author, content) {
    try {
        let comments = [];
        let response; // Declare response variable
        try {
            response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: `${COMMENTS_PATH}/${postId}.json`,
            });
            comments = JSON.parse(atob(response.data.content));
        } catch (error) {
            // File doesn't exist, create a new one
        }

        comments.push({
            author,
            content,
            date: new Date().toISOString()
        });

        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${COMMENTS_PATH}/${postId}.json`,
            message: `Add comment to post ${postId}`,
            content: btoa(JSON.stringify(comments, null, 2)),
            sha: response ? response.data.sha : undefined,
        });
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}
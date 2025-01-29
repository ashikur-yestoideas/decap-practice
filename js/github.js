
const envVariables = process.env.GITHUB_TOKEN;
console.log("env", envVariables);

const GITHUB_TOKEN = '';
const REPO_OWNER = 'ashikur-yestoideas';
const REPO_NAME = 'decap-practice';
const POSTS_PATH = 'posts';

let octokit;

export async function initializeGitHub() {
    const { Octokit } = await import('https://cdn.skypack.dev/@octokit/core');
    octokit = new Octokit({ auth: GITHUB_TOKEN });
}

export async function getPosts(postId = null) {
    try {
        if (postId) {
            const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}/{file}', {
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: POSTS_PATH,
                file: `${postId}.md`,
            });
            const content = atob(response.data.content);
            return { id: postId, ...parsePostContent(content) };
        } else {
            const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: POSTS_PATH,
            });
            return await Promise.all(response.data.map(async (file) => {
                const content = await getPosts(file.name.replace('.md', ''));
                return content;
            }));
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export async function createPost(title, content) {
    try {
        const postId = Date.now().toString();
        const postContent = `---\ntitle: ${title}\ndate: ${new Date().toISOString()}\n---\n\n${content}`;
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${POSTS_PATH}/${postId}.md`,
            message: `Create post: ${title}`,
            content: btoa(postContent),
        });
        return postId;
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

export async function updatePost(postId, title, content) {
    try {
        const postContent = `---\ntitle: ${title}\ndate: ${new Date().toISOString()}\n---\n\n${content}`;
        const currentFile = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${POSTS_PATH}/${postId}.md`,
        });
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${POSTS_PATH}/${postId}.md`,
            message: `Update post: ${title}`,
            content: btoa(postContent),
            sha: currentFile.data.sha,
        });
    } catch (error) {
        console.error('Error updating post:', error);
    }
}

export async function deletePost(postId) {
    try {
        const currentFile = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${POSTS_PATH}/${postId}.md`,
        });
        await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `${POSTS_PATH}/${postId}.md`,
            message: `Delete post: ${postId}`,
            sha: currentFile.data.sha,
        });
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

function parsePostContent(content) {
    const [, frontMatter, body] = content.split('---');
    const metadata = {};
    frontMatter.trim().split('\n').forEach(line => {
        const [key, value] = line.split(':');
        metadata[key.trim()] = value.trim();
    });
    return { ...metadata, content: body.trim() };
}
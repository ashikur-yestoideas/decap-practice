import { getPosts } from './github.js';

export function setupSearch(searchInput, searchButton, renderSearchResults) {
    searchButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const query = searchInput.value.toLowerCase();
        const posts = await getPosts();
        const results = posts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.content.toLowerCase().includes(query)
        );
        renderSearchResults(results);
    });
}
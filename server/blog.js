const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked for clean, semantic, secure rendering
marked.setOptions({
  gfm: true,
  breaks: true
});

const BLOG_DIR = path.resolve(__dirname, '../content/blog');

/**
 * Simple, robust front-matter parser without external unvetted dependencies
 */
function parseFrontMatter(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: rawContent };
  }

  const rawYaml = match[1];
  const bodyContent = match[2];
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    // Parse string quotes or JSON arrays
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        val = JSON.parse(val.replace(/'/g, '"'));
      } catch (e) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      }
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    data[key] = val;
  }

  return { data, content: bodyContent };
}

/**
 * Sanitize rendered HTML output defensively
 */
function sanitizeHtmlSafe(html) {
  // Disallow scripts, iframes, and dangerous event handlers in markdown
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '#');
}

/**
 * Load all blog posts sorted by publish date descending
 */
function getAllPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));

  const posts = files.map(file => {
    const fullPath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseFrontMatter(raw);
    const slug = data.slug || file.replace(/\.md$/, '');
    
    return {
      ...data,
      slug,
      rawContent: content,
      dateFormatted: data.date ? new Date(data.date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : ''
    };
  });

  return posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

/**
 * Get a single blog post by slug with rendered HTML
 */
function getPostBySlug(slug) {
  const posts = getAllPosts();
  const post = posts.find(p => p.slug === slug);
  if (!post) return null;

  const renderedHtml = sanitizeHtmlSafe(marked.parse(post.rawContent));
  const relatedPosts = posts.filter(p => p.slug !== slug).slice(0, 3);

  return {
    ...post,
    html: renderedHtml,
    relatedPosts
  };
}

module.exports = {
  getAllPosts,
  getPostBySlug
};

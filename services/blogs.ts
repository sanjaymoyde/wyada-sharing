import { BlogPost } from '../types';
import { buildApiUrl } from '../utils/api';

interface ShopifyBlog {
    id: number | string;
    title?: string;
}

interface ShopifyArticle {
    id: number | string;
    title?: string;
    body_html?: string;
    summary_html?: string;
    author?: string;
    published_at?: string;
    tags?: string;
    blog_id?: number | string;
    image?: {
        src?: string;
    };
    template_suffix?: string;
}

const BLOGS_ENDPOINT = buildApiUrl('/api/blogs');
const BLOG_ARTICLES_ENDPOINT = (blogId: number | string) => buildApiUrl(`/api/blogs/articles/${blogId}`);
const BLOG_POSTS_CACHE_KEY = 'wayda:blog-posts-cache:v1';
const BLOG_POSTS_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedBlogPostsPayload {
    posts: BlogPost[];
    updatedAt: number;
}

let memoryCache: CachedBlogPostsPayload | null = null;
let inFlightFetch: Promise<BlogPost[]> | null = null;

const fallbackImages = [
    'https://picsum.photos/1200/800?random=11',
    'https://picsum.photos/1200/800?random=12',
    'https://picsum.photos/1200/800?random=13',
    'https://picsum.photos/1200/800?random=14',
];

const pickCategory = (tags: string | undefined, blogTitle: string | undefined): string => {
    const firstTag = tags
        ?.split(',')
        .map((tag) => tag.trim())
        .find(Boolean);

    if (firstTag) return firstTag;
    if (blogTitle) return blogTitle;
    return 'Community';
};

const mapArticle = (article: ShopifyArticle, blogTitle: string | undefined, fallbackImage: string): BlogPost => ({
    id: Number(article.id),
    title: article.title?.trim() || 'Untitled Article',
    category: pickCategory(article.tags, blogTitle),
    image: article.image?.src || fallbackImage,
    body_html: article.body_html,
    summary_html: article.summary_html,
    author: article.author,
    published_at: article.published_at,
    blog_title: blogTitle,
    template_suffix: article.template_suffix
});

const isFreshCache = (payload: CachedBlogPostsPayload | null): payload is CachedBlogPostsPayload => {
    if (!payload || !Array.isArray(payload.posts) || payload.posts.length === 0) return false;
    return (Date.now() - payload.updatedAt) <= BLOG_POSTS_CACHE_TTL_MS;
};

const readCachedBlogPosts = (): CachedBlogPostsPayload | null => {
    if (isFreshCache(memoryCache)) {
        return memoryCache;
    }

    if (typeof window === 'undefined') return null;

    try {
        const raw = window.sessionStorage.getItem(BLOG_POSTS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as Partial<CachedBlogPostsPayload>;
        const payload: CachedBlogPostsPayload | null =
            Array.isArray(parsed.posts) && typeof parsed.updatedAt === 'number'
                ? { posts: parsed.posts, updatedAt: parsed.updatedAt }
                : null;

        if (!isFreshCache(payload)) return null;

        memoryCache = payload;
        return payload;
    } catch {
        return null;
    }
};

const writeCachedBlogPosts = (posts: BlogPost[]): void => {
    const payload: CachedBlogPostsPayload = { posts, updatedAt: Date.now() };
    memoryCache = payload;

    if (typeof window === 'undefined') return;

    try {
        window.sessionStorage.setItem(BLOG_POSTS_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore storage failures and fall back to memory-only cache.
    }
};

export const getCachedDynamicBlogPosts = (): BlogPost[] | null => {
    return readCachedBlogPosts()?.posts ?? null;
};

const loadDynamicBlogPosts = async (): Promise<BlogPost[]> => {
    const blogsResponse = await fetch(BLOGS_ENDPOINT);
    if (!blogsResponse.ok) {
        throw new Error(`Failed to fetch blogs: ${blogsResponse.statusText}`);
    }

    const blogs: ShopifyBlog[] = await blogsResponse.json();
    if (!Array.isArray(blogs) || blogs.length === 0) return [];

    const articleResponses = await Promise.allSettled(
        blogs.map(async (blog) => {
            const response = await fetch(BLOG_ARTICLES_ENDPOINT(blog.id));
            if (!response.ok) return [];
            const articles: ShopifyArticle[] = await response.json();
            if (!Array.isArray(articles)) return [];

            return articles.map((article, index) =>
                mapArticle(article, blog.title, fallbackImages[index % fallbackImages.length]),
            );
        }),
    );

    const posts = articleResponses
        .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
        .flat()
        .sort((a, b) => {
            const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
            const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
            return bTime - aTime;
        });

    if (posts.length > 0) {
        writeCachedBlogPosts(posts);
    }

    return posts;
};

export const fetchDynamicBlogPosts = async (): Promise<BlogPost[]> => {
    const cachedPosts = getCachedDynamicBlogPosts();
    if (cachedPosts) {
        return cachedPosts;
    }

    if (inFlightFetch) {
        return inFlightFetch;
    }

    inFlightFetch = loadDynamicBlogPosts()
        .catch((error) => {
            const fallbackCache = getCachedDynamicBlogPosts();
            if (fallbackCache) {
                return fallbackCache;
            }
            throw error;
        })
        .finally(() => {
            inFlightFetch = null;
        });

    return inFlightFetch;
};

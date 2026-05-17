export interface BlogPostItem {
  href: string;
  title: string;
  note?: string;
}

export interface BlogPostsData {
  items: BlogPostItem[];
}

declare module '../types' {
  interface BlockDataMap {
    blogPosts: BlogPostsData;
  }
}

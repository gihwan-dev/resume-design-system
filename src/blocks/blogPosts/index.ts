import { registerBlock } from '../registry';
import { BlogPostsBlock } from './Block';
import { BlogPostsForm } from './Form';
import type { BlogPostsData } from './types';
export type { BlogPostsData, BlogPostItem } from './types';

registerBlock<'blogPosts'>({
  type: 'blogPosts',
  label: 'Blog Posts',
  hint: '외부 블로그 글 모음',
  icon: '✎',
  Render: BlogPostsBlock,
  Form: BlogPostsForm,
  defaultData: (): BlogPostsData => ({
    items: [{ href: 'https://', title: '글 제목', note: '' }],
  }),
  shortLabel: (d) => `Blog · ${d.items?.length ?? 0}개`,
});

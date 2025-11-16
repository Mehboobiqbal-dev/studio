import { ObjectId } from 'mongodb';

export interface Topic {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
  featuredImage?: string;
  color?: string; // For UI theming
}

export function generateTopicSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


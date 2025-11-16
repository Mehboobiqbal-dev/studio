# Conspiracy & Opinion Platform - Project Plan

## Overview
A Reddit/Quora-style platform focused on conspiracy theories and opinions, with AI-generated content and SEO optimization.

## Core Features

### 1. Content Types
- **Posts/Theories**: Main content (conspiracy theories or opinions)
- **Topics/Categories**: Organize content by subject
- **Comments**: Discussion threads
- **Votes**: Upvote/downvote system
- **AI-Generated Theories**: Gemini generates theories on current/past topics

### 2. Authentication
- **Public Access**: Read all content without login
- **Authenticated Access**: Required to create posts, comment, vote
- JWT-based authentication (already implemented)

### 3. SEO Strategy
- Server-side rendering (SSR) for all public pages
- Dynamic metadata for each post/topic
- Structured data (JSON-LD)
- Sitemap generation
- Open Graph tags
- Canonical URLs

## Database Schema

### Posts Collection
```typescript
{
  _id: ObjectId
  title: string
  content: string
  type: 'conspiracy' | 'opinion'
  topicId: ObjectId
  authorId: ObjectId (optional - null for AI-generated)
  isAIGenerated: boolean
  upvotes: number
  downvotes: number
  commentCount: number
  views: number
  tags: string[]
  slug: string (SEO-friendly URL)
  status: 'published' | 'draft' | 'archived'
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
}
```

### Topics Collection
```typescript
{
  _id: ObjectId
  name: string
  slug: string
  description: string
  postCount: number
  followerCount: number
  createdAt: Date
}
```

### Comments Collection
```typescript
{
  _id: ObjectId
  postId: ObjectId
  authorId: ObjectId
  content: string
  parentId?: ObjectId (for nested comments)
  upvotes: number
  downvotes: number
  createdAt: Date
  updatedAt: Date
}
```

### Votes Collection
```typescript
{
  _id: ObjectId
  postId?: ObjectId
  commentId?: ObjectId
  userId: ObjectId
  type: 'upvote' | 'downvote'
  createdAt: Date
}
```

## Page Structure

### Public Pages (SSR)
1. **Home** (`/`) - Feed of latest posts
2. **Topic Page** (`/t/[slug]`) - Posts in a specific topic
3. **Post Detail** (`/p/[slug]`) - Individual post with comments
4. **Topics List** (`/topics`) - All available topics

### Authenticated Pages
1. **Create Post** (`/create`) - Form to create new post
2. **User Profile** (`/u/[username]`) - User's posts and activity
3. **Dashboard** (`/dashboard`) - User's posts and stats

## AI Integration

### Gemini AI Flow
- Generate conspiracy theories on current events
- Generate theories on historical topics
- Auto-generate content daily/weekly
- Tag and categorize automatically

## SEO Implementation

### Metadata Strategy
- Dynamic title: `{Post Title} | Conspiracy Platform`
- Dynamic description: First 160 chars of content
- Open Graph images
- Structured data for articles
- Breadcrumbs schema

### URL Structure
- Posts: `/p/[slug]`
- Topics: `/t/[slug]`
- Users: `/u/[username]`

## Implementation Phases

### Phase 1: Core Models & Database
- [x] User model (already exists)
- [x] Post model
- [x] Topic model
- [x] Comment model
- [x] Vote model

### Phase 2: Core Pages (SSR)
- [x] Home page with feed
- [x] Post detail page
- [x] Topic page
- [x] Topics list page
- [x] Search page
- [x] Trending page
- [x] User profile page

### Phase 3: AI Integration
- [x] Gemini flow for generating theories
- [x] Auto-generation API endpoint
- [x] Batch generation for topics
- [ ] Scheduled cron job setup (external)

### Phase 4: User Features
- [x] Create post form (auth required)
- [x] Comment system with threading
- [x] Voting system (upvote/downvote)
- [x] User profiles
- [x] Navigation with user menu
- [ ] Follow topics feature
- [ ] Save/bookmark posts

### Phase 5: SEO Optimization
- [x] Dynamic metadata
- [x] Structured data (JSON-LD)
- [x] Sitemap generation
- [x] Open Graph tags
- [x] Canonical URLs
- [x] Robots.txt


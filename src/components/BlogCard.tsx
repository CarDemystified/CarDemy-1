import React from 'react';
import { BlogPost } from '../types';
import { Clock, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  key?: string | number;
  post: BlogPost;
  onClick: (slug: string) => void;
}

export default function BlogCard({ post, onClick }: BlogCardProps) {
  // Estimate reading time
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 220)); // average silent reading speed

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <article
      id={`blog-card-${post.id}`}
      onClick={() => onClick(post.slug)}
      className="group cursor-pointer bg-white border border-slate-200 hover:border-gold-500/40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Featured Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={post.featuredImage || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600'}
          alt={post.title}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/95 text-gold-600 border border-gold-500/20 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full font-semibold shadow-sm">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Date and Reading Time */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <span>{formattedDate}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500/40"></span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gold-500/70" />
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-lg sm:text-xl text-slate-800 group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug tracking-tight">
          {post.title}
        </h3>

        {/* Sub-description description */}
        <p className="text-slate-600 text-sm leading-relaxed font-sans line-clamp-3">
          {post.metaDescription || (post.content ? post.content.replace(/[#*`]/g, '').substring(0, 140) + '...' : '')}
        </p>

        {/* Button link */}
        <div className="pt-2 flex items-center gap-2 text-xs font-mono font-semibold text-gold-600 uppercase tracking-widest group-hover:gap-3 transition-all duration-200">
          <span>Read Full Article</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </article>
  );
}

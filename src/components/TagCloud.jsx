import React from 'react';
import { TagCloud } from 'react-tagcloud';

const TagCloudComponent = ({ tags, posts, limit = 30 }) => {
  // Generate data for the tag cloud - count occurrences and format for the library
  const tagData = tags.map(tag => {
    const count = posts.filter(post => post.data.tags && post.data.tags.includes(tag)).length;
    return {
      value: tag,
      count: count,
      key: tag,
    };
  });

  // Sort by count and take only top 'limit' tags
  const limitedTags = [...tagData]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  // Custom renderer for tags - without background or border, even more reduced height
  const customRenderer = (tag, size, color) => (
    <a
      key={tag.key}
      href={`/tags/${encodeURIComponent(tag.value)}`}
      className="tag-cloud-tag px-1 py-0 m-0.5 inline-block text-white/80 
        hover:text-white hover:text-[#9d7dea] transition-all"
      style={{ 
        fontSize: `${size/40 + 0.5}rem`, // Much smaller scaled down sizes
        fontWeight: size > 35 ? 'bold' : 'normal',
        opacity: 0.7 + (size/35) * 0.3,
        lineHeight: '1.3',
      }}
    >
      {tag.value}
    </a>
  );

  return (
    <div className="tag-cloud-container">
      <TagCloud
        minSize={10}
        maxSize={30}
        tags={limitedTags}
        renderer={customRenderer}
        shuffle={true}
      />
    </div>
  );
};

export default TagCloudComponent;
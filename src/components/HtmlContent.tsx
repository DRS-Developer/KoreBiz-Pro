import React from 'react';

interface HtmlContentProps {
  content: string | null | undefined;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ content, className, tag: Tag = 'div' }) => {
  if (!content) return null;

  const Component = Tag as React.ElementType;

  return (
    <Component 
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default HtmlContent;

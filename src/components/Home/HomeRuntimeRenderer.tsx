import React from 'react';
import HomeBuilder from './HomeBuilder';
import { SectionConfig } from '../../types/home-sections';
import { HomeWidgetDto } from '../../types/home-widgets';

interface HomeRuntimeRendererProps {
  widgets: HomeWidgetDto[];
}

const HomeRuntimeRenderer: React.FC<HomeRuntimeRendererProps> = ({
  widgets,
}) => {
  const mappedSections: SectionConfig[] = widgets
    .filter((widget) => widget.enabled)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((widget) => ({
      id: (widget.widgetType === 'legacy-section' ? widget.settings?.legacySectionId : widget.widgetType) as SectionConfig['id'],
      enabled: widget.enabled,
      variant: (widget.variant || 'default') as SectionConfig['variant'],
      props: (widget.settings || {}) as Record<string, any>,
    }))
    .filter((section) => typeof section.id === 'string');

  if (mappedSections.length === 0) {
    // If we have widgets but none are enabled, we shouldn't show default sections
    // Instead, we show nothing or the builder will be empty.
    // The "Em construção" state is handled in Home.tsx when widgets.length === 0.
    // If we get here, it means widgets exist but mappedSections is empty (e.g. all disabled).
    return null;
  }

  return <HomeBuilder sections={mappedSections} />;
};

export default HomeRuntimeRenderer;

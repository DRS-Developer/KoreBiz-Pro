import React from 'react';
import HomeBuilder from './HomeBuilder';
import { SectionConfig } from '../../types/home-config';
import { HomeWidgetDto } from '../../types/home-widgets';

interface HomeRuntimeRendererProps {
  useWidgetLayout: boolean;
  widgets: HomeWidgetDto[];
  legacySections: SectionConfig[];
}

const HomeRuntimeRenderer: React.FC<HomeRuntimeRendererProps> = ({
  useWidgetLayout,
  widgets,
  legacySections,
}) => {
  if (!useWidgetLayout || widgets.length === 0) {
    return <HomeBuilder sections={legacySections} />;
  }

  const mappedSections: SectionConfig[] = widgets
    .filter((widget) => widget.enabled)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((widget) => ({
      id: (widget.widgetType === 'legacy-section' ? widget.settings?.legacySectionId : widget.widgetType) as SectionConfig['id'],
      enabled: widget.enabled,
      variant: widget.variant || 'default',
      props: (widget.settings || {}) as Record<string, any>,
    }))
    .filter((section) => typeof section.id === 'string');

  if (mappedSections.length === 0) {
    return <HomeBuilder sections={legacySections} />;
  }

  return <HomeBuilder sections={mappedSections} />;
};

export default HomeRuntimeRenderer;

import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SectionConfig } from '../../../types/home-config';
import { SortableSectionItem } from './SortableSectionItem';

interface SectionManagerProps {
  sections: SectionConfig[];
  onReorder: (sections: SectionConfig[]) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdate: (id: string, updates: Partial<SectionConfig>) => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({ sections, onReorder, onToggle, onUpdate }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);
      
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sections.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {sections.map((section) => (
            <SortableSectionItem 
              key={section.id} 
              section={section} 
              onToggle={onToggle}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

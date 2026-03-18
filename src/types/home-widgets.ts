export type HomeWidgetType =
  | 'hero'
  | 'grid'
  | 'card-list'
  | 'form-embed'
  | 'gallery'
  | 'cta'
  | 'legacy-section'
  | string;

export interface HomeWidgetRecord {
  id: string;
  page_key: string;
  widget_type: HomeWidgetType;
  variant: string;
  order_index: number;
  enabled: boolean;
  settings: Record<string, unknown>;
  data_binding: Record<string, unknown> | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface HomeWidgetDto {
  id: string;
  pageKey: string;
  widgetType: HomeWidgetType;
  variant: string;
  orderIndex: number;
  enabled: boolean;
  settings: Record<string, unknown>;
  dataBinding: Record<string, unknown> | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface HomeWidgetUpsertInput {
  id?: string;
  pageKey?: string;
  widgetType: HomeWidgetType;
  variant?: string;
  orderIndex?: number;
  enabled?: boolean;
  settings?: Record<string, unknown>;
  dataBinding?: Record<string, unknown> | null;
  version?: number;
}

export type ElementType =
  | 'section'
  | 'container'
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'icon'
  | 'divider'
  | 'header'
  | 'footer'
  | 'banner';

export interface ElementStyles {
  // Typography
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;

  // Background & Box
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;

  // Sizing & Spacing
  width?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  padding?: string;
  margin?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Border & Effects
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;

  // Flex / Layout (for section & container)
  display?: 'flex' | 'block' | 'grid' | 'inline-flex' | 'inline-block';
  flexDirection?: 'row' | 'column';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  gridTemplateColumns?: string;
  overflow?: string;

  // Freeform Positioning
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number | string;
  transform?: string;
}

export interface BuilderElement {
  id: string;
  type: ElementType;
  name?: string;
  props: Record<string, any>;
  styles: ElementStyles;
  children?: BuilderElement[];
}

export interface BuilderSiteSettings {
  metaTitle?: string;
  metaDescription?: string;
  fontFamily?: string;
  backgroundColor?: string;
  favicon?: string;
}

export interface BuilderSite {
  id: number;
  user_id?: number;
  title: string;
  slug: string;
  data: BuilderElement[];
  settings?: BuilderSiteSettings;
  status: 'draft' | 'published';
  thumbnail?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
  };
}

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export interface DragItem {
  source: 'sidebar' | 'canvas';
  elementType?: ElementType;
  elementId?: string;
}

export interface DropPosition {
  parentId: string | null; // null means root level
  targetIndex: number;
  position: 'before' | 'after' | 'inside';
}

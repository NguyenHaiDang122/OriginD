import type { BuilderElement, ElementType } from "../types/builder";

export const generateId = (prefix = "elem"): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
};

export const COMPONENT_DEFINITIONS: {
  type: ElementType;
  label: string;
  category: 'layout' | 'content' | 'interactive' | 'prebuilt';
  description: string;
  icon: string;
}[] = [
  // Layout
  {
    type: 'section',
    label: 'Section',
    category: 'layout',
    description: 'Khối phân đoạn lớn của trang, hỗ trợ màu nền, ảnh nền và đệm',
    icon: 'Layers',
  },
  {
    type: 'container',
    label: 'Container',
    category: 'layout',
    description: 'Hộp chứa giới hạn chiều rộng, căn giữa hoặc chia cột linh hoạt',
    icon: 'Box',
  },

  // Content
  {
    type: 'heading',
    label: 'Tiêu đề (Heading)',
    category: 'content',
    description: 'Tiêu đề từ H1 đến H6 nổi bật với kiểu chữ tùy biến',
    icon: 'Heading',
  },
  {
    type: 'text',
    label: 'Văn bản (Text)',
    category: 'content',
    description: 'Đoạn văn miêu tả, nội dung bài viết hoặc thông tin chi tiết',
    icon: 'Type',
  },
  {
    type: 'image',
    label: 'Hình ảnh (Image)',
    category: 'content',
    description: 'Chèn ảnh minh họa từ thư viện, tải lên hoặc URL trực tiếp',
    icon: 'Image',
  },
  {
    type: 'video',
    label: 'Video',
    category: 'content',
    description: 'Nhúng video từ YouTube, Vimeo hoặc file MP4 trực tiếp',
    icon: 'Video',
  },

  // Interactive & Decor
  {
    type: 'button',
    label: 'Nút bấm (Button)',
    category: 'interactive',
    description: 'Nút bấm điều hướng, liên kết mua hàng hoặc kêu gọi hành động',
    icon: 'MousePointerClick',
  },
  {
    type: 'icon',
    label: 'Biểu tượng (Icon)',
    category: 'interactive',
    description: 'Bộ sưu tập icon đồ họa hiện đại hỗ trợ kích thước và màu sắc',
    icon: 'Sparkles',
  },
  {
    type: 'divider',
    label: 'Đường phân cách',
    category: 'interactive',
    description: 'Đường kẻ ngang phân tách rõ ràng giữa các phần nội dung',
    icon: 'Minus',
  },

  // Prebuilt Blocks
  {
    type: 'header',
    label: 'Header điều hướng',
    category: 'prebuilt',
    description: 'Thanh menu đầu trang tích hợp logo, các liên kết và nút CTA',
    icon: 'Compass',
  },
  {
    type: 'footer',
    label: 'Footer chân trang',
    category: 'prebuilt',
    description: 'Chân trang kèm bản quyền, cột liên kết và thông tin liên hệ',
    icon: 'PanelBottom',
  },
  {
    type: 'banner',
    label: 'Banner quảng bá',
    category: 'prebuilt',
    description: 'Khối Hero Banner ấn tượng với nền gradient và tiêu đề nổi bật',
    icon: 'Flag',
  },
];

export function createDefaultElement(type: ElementType): BuilderElement {
  const id = generateId(type);

  switch (type) {
    case 'section':
      return {
        id,
        type: 'section',
        name: 'Section Phân Đoạn',
        props: { fullWidth: true },
        styles: {
          width: '100%',
          minHeight: '160px',
          paddingTop: '60px',
          paddingBottom: '60px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#0f172a',
        },
        children: [],
      };

    case 'container':
      return {
        id,
        type: 'container',
        name: 'Container Khối Chứa',
        props: { maxWidth: '1200px' },
        styles: {
          width: '100%',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        },
        children: [],
      };

    case 'heading':
      return {
        id,
        type: 'heading',
        name: 'Tiêu đề',
        props: {
          content: 'Tiêu Đề Trang Web Nổi Bật',
          level: 'h2',
        },
        styles: {
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'left',
          marginBottom: '8px',
        },
      };

    case 'text':
      return {
        id,
        type: 'text',
        name: 'Văn bản',
        props: {
          content: 'Nội dung văn bản giới thiệu sản phẩm hoặc dịch vụ của bạn. Bạn có thể kéo thả để sắp xếp lại vị trí và tùy chỉnh màu sắc, font chữ và kích thước theo ý muốn.',
        },
        styles: {
          fontSize: '16px',
          color: '#94a3b8',
          lineHeight: '1.6',
          textAlign: 'left',
          marginBottom: '16px',
        },
      };

    case 'image':
      return {
        id,
        type: 'image',
        name: 'Hình ảnh',
        props: {
          src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
          alt: 'Hình ảnh minh họa',
          objectFit: 'cover',
        },
        styles: {
          width: '100%',
          maxWidth: '640px',
          height: '320px',
          borderRadius: '12px',
          display: 'block',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      };

    case 'video':
      return {
        id,
        type: 'video',
        name: 'Video',
        props: {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          autoplay: false,
          controls: true,
        },
        styles: {
          width: '100%',
          maxWidth: '720px',
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      };

    case 'button':
      return {
        id,
        type: 'button',
        name: 'Nút bấm',
        props: {
          text: 'Khám Phá Ngay',
          url: '#',
          target: '_self',
          icon: 'ArrowRight',
        },
        styles: {
          backgroundColor: '#6366f1',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: '600',
          paddingTop: '12px',
          paddingBottom: '12px',
          paddingLeft: '28px',
          paddingRight: '28px',
          borderRadius: '10px',
          borderStyle: 'none',
          boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)',
        },
      };

    case 'icon':
      return {
        id,
        type: 'icon',
        name: 'Biểu tượng',
        props: {
          iconName: 'Sparkles',
          size: 36,
          color: '#818cf8',
        },
        styles: {
          display: 'inline-flex',
          padding: '8px',
        },
      };

    case 'divider':
      return {
        id,
        type: 'divider',
        name: 'Đường phân cách',
        props: { style: 'solid' },
        styles: {
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          marginTop: '24px',
          marginBottom: '24px',
        },
      };

    case 'header':
      return {
        id,
        type: 'header',
        name: 'Header Menu',
        props: {
          logoText: 'Thương Hiệu Của Bạn',
          logoImage: '',
          links: [
            { label: 'Trang chủ', url: '#' },
            { label: 'Dịch vụ', url: '#services' },
            { label: 'Bảng giá', url: '#pricing' },
            { label: 'Liên hệ', url: '#contact' },
          ],
          ctaText: 'Đăng Ký',
          ctaUrl: '#contact',
        },
        styles: {
          width: '100%',
          backgroundColor: '#090d16',
          paddingTop: '16px',
          paddingBottom: '16px',
          paddingLeft: '32px',
          paddingRight: '32px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
      };

    case 'footer':
      return {
        id,
        type: 'footer',
        name: 'Footer Chân Trang',
        props: {
          copyright: '© 2026 Tên Doanh Nghiệp. Tất cả các quyền được bảo lưu.',
          description: 'Nền tảng kiến tạo website trực quan số 1 - Sáng tạo không giới hạn.',
          columns: [
            {
              title: 'Sản phẩm',
              links: [
                { label: 'Tính năng chính', url: '#' },
                { label: 'Gói dịch vụ', url: '#' },
                { label: 'Mẫu thiết kế', url: '#' },
              ],
            },
            {
              title: 'Công ty',
              links: [
                { label: 'Về chúng tôi', url: '#' },
                { label: 'Blog kiến thức', url: '#' },
                { label: 'Tuyển dụng', url: '#' },
              ],
            },
            {
              title: 'Hỗ trợ',
              links: [
                { label: 'Trung tâm trợ giúp', url: '#' },
                { label: 'Chính sách bảo mật', url: '#' },
                { label: 'Liên hệ', url: '#' },
              ],
            },
          ],
        },
        styles: {
          width: '100%',
          backgroundColor: '#050811',
          paddingTop: '48px',
          paddingBottom: '32px',
          paddingLeft: '32px',
          paddingRight: '32px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      };

    case 'banner':
      return {
        id,
        type: 'banner',
        name: 'Banner Quảng Bá',
        props: {
          badge: '⚡ Ra mắt phiên bản mới',
          title: 'Khởi Tạo Website Chuyên Nghiệp Trong Chớp Mắt',
          subtitle: 'Kéo thả dễ dàng, không cần kỹ năng lập trình, tối ưu chuyển đổi và hoàn toàn tương thích trên điện thoại.',
          buttonText: 'Bắt Đầu Miễn Phí',
          buttonUrl: '#',
        },
        styles: {
          width: '100%',
          minHeight: '420px',
          backgroundColor: '#1e1b4b',
          backgroundImage: 'radial-gradient(ellipse at top, #4338ca 0%, #0b0f19 100%)',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '24px',
          paddingRight: '24px',
          textAlign: 'center',
          borderRadius: '16px',
        },
      };
  }
}

/**
 * Deep clone element with new IDs for all nodes
 */
export function cloneElement(elem: BuilderElement): BuilderElement {
  const newId = generateId(elem.type);
  const cloned: BuilderElement = {
    ...elem,
    id: newId,
    name: elem.name ? `${elem.name} (Bản sao)` : undefined,
    props: JSON.parse(JSON.stringify(elem.props || {})),
    styles: JSON.parse(JSON.stringify(elem.styles || {})),
    children: elem.children ? elem.children.map((child) => cloneElement(child)) : undefined,
  };
  return cloned;
}

/**
 * Find element and its parent by ID
 */
export function findElementById(
  elements: BuilderElement[],
  id: string,
  parent: BuilderElement | null = null
): { element: BuilderElement; parent: BuilderElement | null; index: number } | null {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].id === id) {
      return { element: elements[i], parent, index: i };
    }
    if (elements[i].children && elements[i].children!.length > 0) {
      const found = findElementById(elements[i].children!, id, elements[i]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Remove element by ID recursively
 */
export function removeElementById(
  elements: BuilderElement[],
  id: string
): { updated: BuilderElement[]; removed: BuilderElement | null } {
  let removed: BuilderElement | null = null;

  function filterTree(list: BuilderElement[]): BuilderElement[] {
    const next: BuilderElement[] = [];
    for (const item of list) {
      if (item.id === id) {
        removed = item;
        continue;
      }
      if (item.children) {
        next.push({
          ...item,
          children: filterTree(item.children),
        });
      } else {
        next.push(item);
      }
    }
    return next;
  }

  const updated = filterTree(elements);
  return { updated, removed };
}

/**
 * Insert element into tree at parentId & targetIndex
 */
export function insertElement(
  elements: BuilderElement[],
  element: BuilderElement,
  parentId: string | null,
  targetIndex: number
): BuilderElement[] {
  if (parentId === null) {
    const copy = [...elements];
    const index = Math.max(0, Math.min(targetIndex, copy.length));
    copy.splice(index, 0, element);
    return copy;
  }

  return elements.map((item) => {
    if (item.id === parentId) {
      const children = item.children ? [...item.children] : [];
      const index = Math.max(0, Math.min(targetIndex, children.length));
      children.splice(index, 0, element);
      return {
        ...item,
        children,
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: insertElement(item.children, element, parentId, targetIndex),
      };
    }
    return item;
  });
}

/**
 * Update element by ID with updater function
 */
export function updateElementById(
  elements: BuilderElement[],
  id: string,
  updater: (elem: BuilderElement) => BuilderElement
): BuilderElement[] {
  return elements.map((item) => {
    if (item.id === id) {
      return updater(item);
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateElementById(item.children, id, updater),
      };
    }
    return item;
  });
}

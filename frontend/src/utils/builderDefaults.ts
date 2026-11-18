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
  {
    type: 'features',
    label: 'Khối Tính năng',
    category: 'prebuilt',
    description: 'Lưới 3 cột tính năng & dịch vụ nổi bật với hiệu ứng thẻ sang trọng',
    icon: 'Zap',
  },
  {
    type: 'pricing',
    label: 'Bảng Giá Dịch Vụ',
    category: 'prebuilt',
    description: 'Bảng so sánh 3 gói giá dịch vụ với danh sách tính năng và nút mua',
    icon: 'CreditCard',
  },
  {
    type: 'testimonials',
    label: 'Đánh Giá Khách Hàng',
    category: 'prebuilt',
    description: 'Khối phản hồi của khách hàng kèm đánh giá 5 sao và avatar uy tín',
    icon: 'Star',
  },
  {
    type: 'faq',
    label: 'Hỏi Đáp (FAQ)',
    category: 'prebuilt',
    description: 'Danh sách câu hỏi thường gặp dạng Accordion đóng mở tiện lợi',
    icon: 'HelpCircle',
  },
  {
    type: 'form',
    label: 'Form Liên Hệ / Tư Vấn',
    category: 'interactive',
    description: 'Biểu mẫu thu thập thông tin khách hàng, số điện thoại và email',
    icon: 'Send',
  },
  {
    type: 'countdown',
    label: 'Đếm Ngược Ưu Đãi',
    category: 'interactive',
    description: 'Đồng hồ đếm ngược ngày giờ phút giây kích thích chuyển đổi đơn hàng',
    icon: 'Flame',
  },
  {
    type: 'stats',
    label: 'Số Liệu Thống Kê',
    category: 'prebuilt',
    description: 'Khối chỉ số ấn tượng thể hiện năng lực và quy mô của doanh nghiệp',
    icon: 'Award',
  },
  {
    type: 'cta',
    label: 'Kêu Gọi Hành Động (CTA)',
    category: 'prebuilt',
    description: 'Khối banner kêu gọi chốt sale mạnh mẽ với nút bấm kép nổi bật',
    icon: 'Rocket',
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

    case 'features':
      return {
        id,
        type: 'features',
        name: 'Khối Tính Năng',
        props: {
          badge: '⚡ ĐIỂM NỔI BẬT',
          title: 'Tính Năng Đột Phá Cho Doanh Nghiệp',
          subtitle: 'Bộ công cụ mạnh mẽ giúp bạn tạo lập vị thế dẫn đầu thị trường và tối ưu hóa chuyển đổi.',
          items: [
            {
              icon: 'Zap',
              title: 'Tốc Độ Vượt Trội',
              description: 'Tải trang siêu tốc dưới 0.5s, nâng cao điểm SEO Google và giữ chân khách hàng tối đa.',
            },
            {
              icon: 'ShieldCheck',
              title: 'Bảo Mật Tiêu Chuẩn Cao',
              description: 'Mã hóa SSL 256-bit chuẩn ngân hàng cùng tường lửa bảo vệ toàn diện dữ liệu khách hàng 24/7.',
            },
            {
              icon: 'Smartphone',
              title: 'Tối Ưu 100% Di Động',
              description: 'Trải nghiệm mượt mà, tự động co giãn sắc nét trên mọi thiết bị di động, tablet và laptop.',
            },
          ],
        },
        styles: {
          width: '100%',
          paddingTop: '64px',
          paddingBottom: '64px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#090d16',
        },
      };

    case 'pricing':
      return {
        id,
        type: 'pricing',
        name: 'Bảng Giá Dịch Vụ',
        props: {
          badge: '💎 BẢNG GIÁ MINH BẠCH',
          title: 'Gói Dịch Vụ Đầu Tư Thông Minh',
          subtitle: 'Lựa chọn gói giải pháp phù hợp với mục tiêu và ngân sách của doanh nghiệp bạn.',
          tiers: [
            {
              name: 'Khởi Nghiệp',
              price: '299.000đ',
              period: '/tháng',
              description: 'Hoàn hảo cho cá nhân và dự án mới bắt đầu',
              isPopular: false,
              features: [
                '1 Website kéo thả chuẩn SEO',
                'Miễn phí SSL & Băng thông',
                'Hỗ trợ kỹ thuật 24/7',
                'Tốc độ tải trang siêu tốc',
              ],
              buttonText: 'Bắt Đầu Ngay',
              buttonUrl: '#contact',
            },
            {
              name: 'Chuyên Nghiệp',
              price: '599.000đ',
              period: '/tháng',
              description: 'Lựa chọn hàng đầu của 90% doanh nghiệp vừa & nhỏ',
              isPopular: true,
              features: [
                'Tạo không giới hạn trang',
                'Tên miền riêng tùy chỉnh (.com, .vn)',
                'Tích hợp thanh toán QR tự động',
                'Thống kê số liệu thời gian thực',
                'Ưu tiên hỗ trợ riêng 1:1',
              ],
              buttonText: 'Dùng Thử Miễn Phí',
              buttonUrl: '#contact',
            },
            {
              name: 'Doanh Nghiệp',
              price: '1.299.000đ',
              period: '/tháng',
              description: 'Giải pháp cao cấp với hạ tầng máy chủ chuyên biệt',
              isPopular: false,
              features: [
                'Tất cả tính năng gói Chuyên Nghiệp',
                'Máy chủ Cloud Dedicated riêng',
                'Tùy biến mã nguồn & API nâng cao',
                'Bảo mật tường lửa chuẩn quốc tế',
              ],
              buttonText: 'Liên Hệ Báo Giá',
              buttonUrl: '#contact',
            },
          ],
        },
        styles: {
          width: '100%',
          paddingTop: '72px',
          paddingBottom: '72px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#0c101d',
        },
      };

    case 'testimonials':
      return {
        id,
        type: 'testimonials',
        name: 'Đánh Giá Khách Hàng',
        props: {
          badge: '⭐ ĐÁNH GIÁ TỪ KHÁCH HÀNG',
          title: 'Khách Hàng Nói Gì Về Chúng Tôi?',
          subtitle: 'Hơn 5.000+ cá nhân và doanh nghiệp đã tin tưởng đồng hành cùng nền tảng.',
          items: [
            {
              name: 'Trần Minh Hoàng',
              role: 'Giám đốc TechMedia',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: 'Giao diện cực kỳ đẹp và tối ưu. Tôi đã hoàn thành website công ty chỉ trong 1 buổi chiều mà không cần thuê lập trình viên bên ngoài.',
            },
            {
              name: 'Nguyễn Bích Phương',
              role: 'Chủ shop Thời Trang Daisy',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: 'Khách hàng xem trên điện thoại cực mượt. Tỷ lệ chuyển đổi đơn hàng tăng vọt 40% chỉ sau tuần đầu tiên sử dụng.',
            },
            {
              name: 'Lê Quốc Tuấn',
              role: 'Founder Startup Logistics',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              rating: 5,
              content: 'Tính năng tự động tối ưu hóa giao diện thực sự đỉnh cao. Kéo thả tùy ý mà website vẫn giữ được vẻ đẹp sắc nét và chuyên nghiệp.',
            },
          ],
        },
        styles: {
          width: '100%',
          paddingTop: '72px',
          paddingBottom: '72px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#090d16',
        },
      };

    case 'faq':
      return {
        id,
        type: 'faq',
        name: 'Hỏi Đáp (FAQ)',
        props: {
          badge: '❓ GIẢI ĐÁP THẮC MẮC',
          title: 'Câu Hỏi Thường Gặp (FAQ)',
          subtitle: 'Những câu hỏi được khách hàng quan tâm nhiều nhất khi bắt đầu xây dựng website.',
          items: [
            {
              q: 'Tôi không biết lập trình có tự thiết kế website được không?',
              a: 'Hoàn toàn được! Nền tảng được thiết kế kéo thả trực quan 100%, bạn chỉ cần chọn khối, thay đổi chữ, ảnh và xuất bản trong vài phút.',
            },
            {
              q: 'Website tạo ra có hiển thị tốt trên điện thoại di động không?',
              a: 'Có, toàn bộ giao diện đều được tích hợp công nghệ Responsive tự động tối ưu tỉ lệ chuẩn trên mọi kích thước màn hình từ điện thoại, iPad đến máy tính.',
            },
            {
              q: 'Tôi có thể gắn tên miền riêng của mình vào website không?',
              a: 'Có, bạn hoàn toàn có thể trỏ tên miền riêng (.com, .vn, .net...) vào website bất cứ lúc nào trong bảng quản trị.',
            },
            {
              q: 'Nếu gặp sự cố kỹ thuật tôi sẽ được hỗ trợ như thế nào?',
              a: 'Đội ngũ kỹ thuật hỗ trợ trực tiếp qua Zalo, Hotline và Ticket 24/7 để đồng hành cùng bạn xuyên suốt quá trình vận hành.',
            },
          ],
        },
        styles: {
          width: '100%',
          paddingTop: '72px',
          paddingBottom: '72px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#0c101d',
        },
      };

    case 'form':
      return {
        id,
        type: 'form',
        name: 'Form Liên Hệ / Tư Vấn',
        props: {
          badge: '📩 KẾT NỐI NGAY',
          title: 'Đăng Ký Nhận Tư Vấn Miễn Phí',
          subtitle: 'Để lại thông tin bên dưới, chuyên viên của chúng tôi sẽ liên hệ lại với bạn trong vòng 15 phút.',
          namePlaceholder: 'Họ và tên của bạn',
          phonePlaceholder: 'Số điện thoại liên hệ',
          emailPlaceholder: 'Địa chỉ Email',
          messagePlaceholder: 'Nhu cầu hoặc câu hỏi cụ thể của bạn...',
          buttonText: 'Gửi Thông Tin Ngay',
          successMessage: 'Cảm ơn bạn! Chúng tôi đã nhận được thông tin và sẽ phản hồi sớm nhất.',
        },
        styles: {
          width: '100%',
          maxWidth: '680px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: '36px',
          paddingBottom: '36px',
          paddingLeft: '32px',
          paddingRight: '32px',
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        },
      };

    case 'countdown':
      return {
        id,
        type: 'countdown',
        name: 'Đồng Hồ Đếm Ngược',
        props: {
          badge: '🔥 ƯU ĐÃI ĐẶC BIỆT CÓ HẠN',
          title: 'Chương Trình Khuyến Mãi Sắp Kết Thúc!',
          subtitle: 'Nhanh tay đăng ký trước khi hết thời gian để nhận ưu đãi giảm 50% trọn đời.',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          ctaText: 'Nhận Ưu Đãi 50% Ngay',
          ctaUrl: '#pricing',
        },
        styles: {
          width: '100%',
          paddingTop: '56px',
          paddingBottom: '56px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#1e112a',
          backgroundImage: 'radial-gradient(ellipse at center, #581c87 0%, #11071f 100%)',
          textAlign: 'center',
          borderRadius: '16px',
        },
      };

    case 'stats':
      return {
        id,
        type: 'stats',
        name: 'Số Liệu Thống Kê',
        props: {
          items: [
            { value: '10.000+', label: 'Khách hàng tin cậy', icon: 'Users' },
            { value: '99.8%', label: 'Tỷ lệ hài lòng', icon: 'Star' },
            { value: '24/7', label: 'Hỗ trợ kỹ thuật', icon: 'ShieldCheck' },
            { value: '0.4s', label: 'Tốc độ tải trang', icon: 'Zap' },
          ],
        },
        styles: {
          width: '100%',
          paddingTop: '48px',
          paddingBottom: '48px',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: '#0b0f19',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      };

    case 'cta':
      return {
        id,
        type: 'cta',
        name: 'Kêu Gọi Hành Động (CTA)',
        props: {
          badge: '🚀 SẴN SÀNG BỨT PHÁ',
          title: 'Bắt Đầu Xây Dựng Website Đẳng Cấp Ngay Hôm Nay',
          subtitle: 'Tham gia cùng hàng nghìn nhà sáng tạo và doanh nghiệp hàng đầu đang phát triển trên nền tảng của chúng tôi.',
          primaryButtonText: 'Khởi Tạo Miễn Phí',
          primaryButtonUrl: '#',
          secondaryButtonText: 'Xem Hướng Dẫn',
          secondaryButtonUrl: '#',
        },
        styles: {
          width: '100%',
          minHeight: '340px',
          backgroundColor: '#1e1b4b',
          backgroundImage: 'radial-gradient(ellipse at bottom, #4338ca 0%, #090d16 100%)',
          paddingTop: '64px',
          paddingBottom: '64px',
          paddingLeft: '24px',
          paddingRight: '24px',
          textAlign: 'center',
          borderRadius: '24px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
        },
      };
  }
}

/**
 * Pre-optimized section templates ready to drop onto page
 */
export const PREBUILT_SECTION_TEMPLATES: {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  create: () => BuilderElement;
}[] = [
  {
    id: 'tpl-hero',
    name: 'Hero Banner Hiện Đại',
    category: 'Mở đầu',
    description: 'Khối giới thiệu ấn tượng với tiêu đề lớn, huy hiệu và nút kêu gọi kép',
    icon: 'Flag',
    create: () => createDefaultElement('banner'),
  },
  {
    id: 'tpl-features',
    name: 'Khối 3 Tính Năng Sang Trọng',
    category: 'Nội dung',
    description: '3 thẻ tính năng với icon sáng, viền hiệu ứng kính mờ và tiêu đề thu hút',
    icon: 'Zap',
    create: () => createDefaultElement('features'),
  },
  {
    id: 'tpl-pricing',
    name: 'Bảng Giá 3 Gói Dịch Vụ',
    category: 'Bán hàng',
    description: 'Bảng so sánh 3 cấp độ giá với gói nổi bật và danh sách dấu kiểm xanh',
    icon: 'CreditCard',
    create: () => createDefaultElement('pricing'),
  },
  {
    id: 'tpl-stats',
    name: 'Thống Kê Số Liệu Nổi Bật',
    category: 'Uy tín',
    description: 'Khối 4 con số ấn tượng chứng minh quy mô và độ tin cậy của doanh nghiệp',
    icon: 'Award',
    create: () => createDefaultElement('stats'),
  },
  {
    id: 'tpl-testimonials',
    name: 'Đánh Giá Khách Hàng 5 Sao',
    category: 'Uy tín',
    description: '3 đánh giá khách hàng có avatar, lời nhận xét và xếp hạng 5 sao rực rỡ',
    icon: 'Star',
    create: () => createDefaultElement('testimonials'),
  },
  {
    id: 'tpl-faq',
    name: 'Câu Hỏi Thường Gặp (Accordion)',
    category: 'Hỗ trợ',
    description: '4 câu hỏi phổ biến dạng accordion cho phép bấm xem chi tiết tiện lợi',
    icon: 'HelpCircle',
    create: () => createDefaultElement('faq'),
  },
  {
    id: 'tpl-form',
    name: 'Form Thu Thập Khách Hàng',
    category: 'Chuyển đổi',
    description: 'Biểu mẫu đăng ký tư vấn kèm trường nhập Tên, Điện thoại, Email và Lời nhắn',
    icon: 'Send',
    create: () => createDefaultElement('form'),
  },
  {
    id: 'tpl-countdown',
    name: 'Đồng Hồ Đếm Ngược Flash Sale',
    category: 'Chuyển đổi',
    description: 'Banner đếm ngược thời gian kích thích khách hàng hành động ngay',
    icon: 'Flame',
    create: () => createDefaultElement('countdown'),
  },
  {
    id: 'tpl-cta',
    name: 'Kêu Gọi Hành Động (CTA Box)',
    category: 'Chuyển đổi',
    description: 'Hộp kêu gọi chuyển đổi cao cấp với hiệu ứng ánh sáng gradient',
    icon: 'Rocket',
    create: () => createDefaultElement('cta'),
  },
];

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

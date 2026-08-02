import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export default function SEO({ title, description, keywords, image }: SEOProps) {
  const siteName = "OriginD";
  const defaultTitle = "OriginD - Nền Tảng Thiết Kế Website Chuyên Nghiệp";
  const defaultDescription = "Tạo website nhanh chóng, miễn phí, đơn giản. Thiết kế xây dựng website chuẩn SEO theo yêu cầu chuyên nghiệp cùng OriginD.";
  
  const finalTitle = title ? `${title}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  
  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter */}
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      {image && <meta property="twitter:image" content={image} />}
    </Helmet>
  );
}

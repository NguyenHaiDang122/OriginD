import type {
  BuilderElement,
  BuilderSiteSettings,
  DesignTheme,
  DesignThemeId,
  OptimizeOptions,
  OptimizeReport,
} from "../types/builder";

export const DESIGN_THEMES: Record<DesignThemeId, DesignTheme> = {
  'cyber-indigo': {
    id: 'cyber-indigo',
    name: 'Cyber Indigo',
    tagline: 'Hiện đại, Công nghệ & Khởi nghiệp',
    primary: '#6366f1', // Indigo 500
    secondary: '#4338ca', // Indigo 700
    accent: '#818cf8', // Indigo 400
    bgDark: '#090d16',
    bgCard: '#0f172a',
    textHeading: '#ffffff',
    textMuted: '#94a3b8',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    fontFamily: 'Inter, sans-serif',
    previewColors: ['#6366f1', '#4338ca', '#090d16', '#ffffff'],
  },
  'emerald-fintech': {
    id: 'emerald-fintech',
    name: 'Emerald Luxe',
    tagline: 'Tài chính, Uy tín & Thịnh vượng',
    primary: '#10b981', // Emerald 500
    secondary: '#047857', // Emerald 700
    accent: '#34d399', // Emerald 400
    bgDark: '#06120e',
    bgCard: '#0b1f18',
    textHeading: '#ffffff',
    textMuted: '#99f6e4',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    fontFamily: 'Poppins, sans-serif',
    previewColors: ['#10b981', '#047857', '#06120e', '#34d399'],
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Gold',
    tagline: 'Sang trọng, Nhiệt huyết & Thương mại',
    primary: '#f59e0b', // Amber 500
    secondary: '#ea580c', // Orange 600
    accent: '#fbbf24', // Amber 400
    bgDark: '#0f0a06',
    bgCard: '#1c130d',
    textHeading: '#ffffff',
    textMuted: '#fed7aa',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    fontFamily: 'Montserrat, sans-serif',
    previewColors: ['#f59e0b', '#ea580c', '#0f0a06', '#fbbf24'],
  },
  'neon-purple': {
    id: 'neon-purple',
    name: 'Neon Cyberpunk',
    tagline: 'Sáng tạo, Giải trí & Giới trẻ',
    primary: '#a855f7', // Purple 500
    secondary: '#db2777', // Pink 600
    accent: '#c084fc', // Purple 400
    bgDark: '#0c0716',
    bgCard: '#170e2c',
    textHeading: '#ffffff',
    textMuted: '#e9d5ff',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    fontFamily: 'Poppins, sans-serif',
    previewColors: ['#a855f7', '#db2777', '#0c0716', '#c084fc'],
  },
  'ocean-corporate': {
    id: 'ocean-corporate',
    name: 'Ocean Blue',
    tagline: 'Doanh nghiệp, Y tế & Dịch vụ chuẩn mực',
    primary: '#0284c7', // Sky 600
    secondary: '#1d4ed8', // Blue 700
    accent: '#38bdf8', // Sky 400
    bgDark: '#060d1a',
    bgCard: '#0d182e',
    textHeading: '#ffffff',
    textMuted: '#bae6fd',
    borderColor: 'rgba(2, 132, 199, 0.25)',
    fontFamily: 'Roboto, sans-serif',
    previewColors: ['#0284c7', '#1d4ed8', '#060d1a', '#38bdf8'],
  },
  'minimal-dark': {
    id: 'minimal-dark',
    name: 'Minimalist Studio',
    tagline: 'Tối giản Đẳng cấp, Chuẩn Studio Apple/Vercel',
    primary: '#f4f4f5', // Zinc 100
    secondary: '#71717a', // Zinc 500
    accent: '#ffffff',
    bgDark: '#09090b', // Zinc 950
    bgCard: '#18181b', // Zinc 900
    textHeading: '#ffffff',
    textMuted: '#a1a1aa', // Zinc 400
    borderColor: 'rgba(255, 255, 255, 0.12)',
    fontFamily: 'Inter, sans-serif',
    previewColors: ['#ffffff', '#71717a', '#09090b', '#27272a'],
  },
};

/**
 * Clean & normalize numeric pixel strings
 */
function parsePx(val?: string): number | null {
  if (!val) return null;
  const match = val.match(/^(\d+(?:\.\d+)?)px$/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Main Smart Auto-Optimization Function
 */
export function optimizeWebsite(
  elements: BuilderElement[],
  siteSettings: BuilderSiteSettings,
  options: OptimizeOptions
): {
  optimizedElements: BuilderElement[];
  updatedSettings: BuilderSiteSettings;
  report: OptimizeReport;
} {
  const theme = DESIGN_THEMES[options.themeId] || DESIGN_THEMES['cyber-indigo'];

  let modifiedCount = 0;
  let fixedMobileCount = 0;
  let typographyAdjustedCount = 0;

  let sectionCounter = 0;

  function optimizeElement(el: BuilderElement): BuilderElement {
    const nextStyles = { ...el.styles };
    const nextProps = { ...el.props };
    let wasModified = false;

    // 1. MOBILE RESPONSIVENESS FIXES
    if (options.optimizeMobile) {
      // Fix fixed pixel widths that blow out mobile viewports
      const wPx = parsePx(nextStyles.width);
      if (wPx && wPx > 360) {
        nextStyles.maxWidth = `${wPx}px`;
        nextStyles.width = '100%';
        fixedMobileCount++;
        wasModified = true;
      }

      // Ensure minHeight isn't overly rigid
      const mhPx = parsePx(nextStyles.minHeight);
      if (mhPx && mhPx > 600 && el.type !== 'banner') {
        nextStyles.minHeight = '300px';
        fixedMobileCount++;
        wasModified = true;
      }
    }

    // 2. UNIFY BORDERS & SHADOWS
    if (options.unifyBordersAndShadows) {
      if (
        ['container', 'features', 'pricing', 'testimonials', 'faq', 'form', 'countdown', 'stats', 'cta'].includes(el.type)
      ) {
        if (!nextStyles.borderRadius || nextStyles.borderRadius === '0px') {
          nextStyles.borderRadius = '16px';
          wasModified = true;
        }
      }

      if (['image', 'video'].includes(el.type)) {
        if (!nextStyles.borderRadius) {
          nextStyles.borderRadius = '14px';
          wasModified = true;
        }
      }

      if (el.type === 'button') {
        nextStyles.borderRadius = '12px';
        wasModified = true;
      }
    }

    // 3. COLOR HARMONY & BACKGROUNDS
    if (options.harmonizeColors) {
      switch (el.type) {
        case 'section': {
          sectionCounter++;
          nextStyles.width = '100%';
          // Alternate section backgrounds for polished depth
          if (sectionCounter % 2 === 1) {
            nextStyles.backgroundColor = theme.bgDark;
          } else {
            nextStyles.backgroundColor = theme.bgCard;
          }
          wasModified = true;
          break;
        }

        case 'header': {
          nextStyles.backgroundColor = theme.bgDark;
          nextStyles.borderColor = theme.borderColor;
          nextStyles.borderWidth = '1px';
          nextStyles.borderStyle = 'solid';
          wasModified = true;
          break;
        }

        case 'footer': {
          nextStyles.backgroundColor = '#040711';
          nextStyles.borderColor = 'rgba(255, 255, 255, 0.08)';
          wasModified = true;
          break;
        }

        case 'banner': {
          nextStyles.backgroundColor = theme.bgDark;
          nextStyles.backgroundImage = `radial-gradient(ellipse at top, ${theme.secondary}40 0%, ${theme.bgDark} 100%)`;
          wasModified = true;
          break;
        }

        case 'button': {
          if (options.themeId === 'minimal-dark') {
            nextStyles.backgroundColor = '#ffffff';
            nextStyles.color = '#09090b';
            nextStyles.boxShadow = '0 8px 20px -4px rgba(255, 255, 255, 0.25)';
          } else {
            nextStyles.backgroundColor = theme.primary;
            nextStyles.color = '#ffffff';
            nextStyles.boxShadow = `0 10px 25px -5px ${theme.primary}50`;
          }
          wasModified = true;
          break;
        }

        case 'divider': {
          nextStyles.backgroundColor = theme.borderColor;
          wasModified = true;
          break;
        }

        case 'icon': {
          nextProps.color = theme.accent;
          nextStyles.color = theme.accent;
          wasModified = true;
          break;
        }
      }
    }

    // 4. TYPOGRAPHY HIERARCHY
    if (options.normalizeTypography) {
      nextStyles.fontFamily = theme.fontFamily;

      if (el.type === 'heading') {
        const level = nextProps.level || 'h2';
        nextStyles.color = theme.textHeading;
        nextStyles.fontWeight = '700';
        nextStyles.letterSpacing = '-0.02em';

        if (level === 'h1') {
          nextStyles.fontSize = '44px';
          nextStyles.lineHeight = '1.15';
          nextStyles.marginBottom = '14px';
        } else if (level === 'h2') {
          nextStyles.fontSize = '32px';
          nextStyles.lineHeight = '1.25';
          nextStyles.marginBottom = '12px';
        } else if (level === 'h3') {
          nextStyles.fontSize = '22px';
          nextStyles.lineHeight = '1.3';
          nextStyles.marginBottom = '8px';
        } else {
          nextStyles.fontSize = '18px';
          nextStyles.lineHeight = '1.4';
          nextStyles.marginBottom = '8px';
        }
        typographyAdjustedCount++;
        wasModified = true;
      }

      if (el.type === 'text') {
        nextStyles.color = theme.textMuted;
        nextStyles.fontSize = '16px';
        nextStyles.lineHeight = '1.65';
        nextStyles.marginBottom = '16px';
        typographyAdjustedCount++;
        wasModified = true;
      }
    }

    // 5. SPACING & PADDING NORMALIZATION
    if (options.normalizeSpacing) {
      if (el.type === 'section') {
        nextStyles.paddingTop = '72px';
        nextStyles.paddingBottom = '72px';
        nextStyles.paddingLeft = '24px';
        nextStyles.paddingRight = '24px';
        wasModified = true;
      }

      if (el.type === 'container') {
        nextStyles.width = '100%';
        nextStyles.maxWidth = '1140px';
        nextStyles.marginLeft = 'auto';
        nextStyles.marginRight = 'auto';
        nextStyles.paddingLeft = '16px';
        nextStyles.paddingRight = '16px';
        wasModified = true;
      }

      if (el.type === 'button') {
        nextStyles.paddingTop = '12px';
        nextStyles.paddingBottom = '12px';
        nextStyles.paddingLeft = '28px';
        nextStyles.paddingRight = '28px';
        nextStyles.fontSize = '15px';
        nextStyles.fontWeight = '600';
        wasModified = true;
      }
    }

    if (wasModified) {
      modifiedCount++;
    }

    // Recursively optimize children
    const nextChildren = el.children
      ? el.children.map((child) => optimizeElement(child))
      : undefined;

    return {
      ...el,
      props: nextProps,
      styles: nextStyles,
      children: nextChildren,
    };
  }

  const optimizedElements = elements.map((el) => optimizeElement(el));

  const updatedSettings: BuilderSiteSettings = {
    ...siteSettings,
    fontFamily: theme.fontFamily,
    backgroundColor: theme.bgDark,
  };

  return {
    optimizedElements,
    updatedSettings,
    report: {
      modifiedCount,
      fixedMobileCount,
      typographyAdjustedCount,
      themeApplied: theme.name,
    },
  };
}

/**
 * Quick Beautify a Single Element
 */
export function autoBeautifyElement(
  element: BuilderElement,
  themeId: DesignThemeId = 'cyber-indigo'
): BuilderElement {
  const theme = DESIGN_THEMES[themeId] || DESIGN_THEMES['cyber-indigo'];
  const nextStyles = { ...element.styles };
  const nextProps = { ...element.props };

  switch (element.type) {
    case 'button':
      nextStyles.backgroundColor = theme.primary;
      nextStyles.color = '#ffffff';
      nextStyles.borderRadius = '12px';
      nextStyles.paddingTop = '12px';
      nextStyles.paddingBottom = '12px';
      nextStyles.paddingLeft = '28px';
      nextStyles.paddingRight = '28px';
      nextStyles.fontSize = '15px';
      nextStyles.fontWeight = '600';
      nextStyles.boxShadow = `0 10px 25px -5px ${theme.primary}50`;
      nextStyles.borderStyle = 'none';
      break;

    case 'heading':
      nextStyles.color = theme.textHeading;
      nextStyles.fontWeight = '700';
      nextStyles.letterSpacing = '-0.02em';
      if ((nextProps.level || 'h2') === 'h1') {
        nextStyles.fontSize = '44px';
        nextStyles.lineHeight = '1.15';
      } else {
        nextStyles.fontSize = '32px';
        nextStyles.lineHeight = '1.25';
      }
      break;

    case 'text':
      nextStyles.color = theme.textMuted;
      nextStyles.fontSize = '16px';
      nextStyles.lineHeight = '1.65';
      break;

    case 'container':
      nextStyles.maxWidth = '1140px';
      nextStyles.width = '100%';
      nextStyles.marginLeft = 'auto';
      nextStyles.marginRight = 'auto';
      nextStyles.paddingLeft = '16px';
      nextStyles.paddingRight = '16px';
      break;

    case 'section':
      nextStyles.width = '100%';
      nextStyles.paddingTop = '72px';
      nextStyles.paddingBottom = '72px';
      nextStyles.paddingLeft = '24px';
      nextStyles.paddingRight = '24px';
      nextStyles.backgroundColor = theme.bgDark;
      break;

    default:
      if (nextStyles.borderRadius === undefined) {
        nextStyles.borderRadius = '14px';
      }
      break;
  }

  return {
    ...element,
    props: nextProps,
    styles: nextStyles,
  };
}

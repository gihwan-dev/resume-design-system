/**
 * Theme contract — the shape every theme must implement.
 * Values are emitted as CSS variables by ThemeProvider so that
 * the resume stylesheet (`.rs-*` rules in styles/resume.global.ts)
 * can stay theme-agnostic. Print output uses the same variables.
 */
export interface Theme {
  name: string;
  colors: {
    text: {
      primary: string;
      secondary: string;
      muted: string;
      faint: string;
      inverse: string;
    };
    surface: {
      page: string;
      soft: string;
      paper: string;
      code: string;
    };
    border: {
      subtle: string;
      strong: string;
      accent: string;
    };
    accent: {
      primary: string;
      soft: string;
      on: string;
    };
    chrome: {
      bg: string;
      panel: string;
      panelBorder: string;
      hover: string;
      selected: string;
      danger: string;
      success: string;
      tagBg: string;
    };
  };
  fonts: {
    sans: string;
    mono: string;
  };
  fontSize: {
    name: string;
    role: string;
    contact: string;
    intro: string;
    section: string;
    sectionMeta: string;
    project: string;
    stack: string;
    body: string;
    bullet: string;
    emphasis: string;
    metric: string;
    learning: string;
    link: string;
  };
  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    body: number;
    loose: number;
  };
  tracking: {
    tight: string;
    normal: string;
    section: string;
  };
  space: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
  };
  gap: {
    section: string;
    block: string;
    paragraph: string;
    bullet: string;
  };
  a4: {
    width: string;
    height: string;
    padX: string;
    padY: string;
    contentW: string;
  };
  borderWidth: {
    hair: string;
    thin: string;
    medium: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    pill: string;
  };
  shadow: {
    paper: string;
  };
}

declare module '@emotion/react' {
  // Augment emotion's Theme to match our shape so styled/css can consume it.
  // We intentionally redeclare the same fields rather than `extends import(...)`
  // because TypeScript can't extend an inline import expression in interfaces.
  export interface Theme {
    name: string;
    colors: ResumeTheme['colors'];
    fonts: ResumeTheme['fonts'];
    fontSize: ResumeTheme['fontSize'];
    fontWeight: ResumeTheme['fontWeight'];
    lineHeight: ResumeTheme['lineHeight'];
    tracking: ResumeTheme['tracking'];
    space: ResumeTheme['space'];
    gap: ResumeTheme['gap'];
    a4: ResumeTheme['a4'];
    borderWidth: ResumeTheme['borderWidth'];
    radius: ResumeTheme['radius'];
    shadow: ResumeTheme['shadow'];
  }
}

// Alias so the augmentation can reference our type without circularity tricks.
type ResumeTheme = Theme;

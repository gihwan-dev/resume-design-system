import { Global, ThemeProvider as EmotionThemeProvider, css } from '@emotion/react';
import { useMemo, type ReactNode } from 'react';
import { THEMES, type ThemeName } from './themes';
import { themeToCssVars } from './cssVars';
import { resumeGlobalStyles } from '../styles/resume.global';
import { chromeGlobalStyles } from '../styles/chrome.global';
import { printGlobalStyles } from '../styles/print.global';

interface Props {
  themeName: ThemeName;
  children: ReactNode;
}

export function ThemeProvider({ themeName, children }: Props) {
  const theme = THEMES[themeName] ?? THEMES.default;
  if (!theme) throw new Error('default theme missing');

  const tokensCss = useMemo(() => themeToCssVars(theme), [theme]);

  return (
    <EmotionThemeProvider theme={theme}>
      <Global
        styles={css`
          ${tokensCss}
          ${resumeGlobalStyles}
          ${chromeGlobalStyles}
          ${printGlobalStyles}
        `}
      />
      {children}
    </EmotionThemeProvider>
  );
}

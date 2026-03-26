import React from 'react';

type HeaderProps = Record<string, never>;

/**
 * @deprecated Replaced by components/layout/TopBar.tsx in the Obsidian redesign.
 * Kept here to avoid build errors from any orphan reference, but not rendered in the app.
 */
const Header: React.FC<HeaderProps> = () => {
  return null;
};

export default Header;

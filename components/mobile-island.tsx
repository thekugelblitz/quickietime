/* eslint-disable @next/next/no-html-link-for-pages -- Full document links intentionally cross authenticated surfaces. */
'use client';
import {useState} from 'react';
import {Menu, X, Zap, LayoutDashboard, History, Sparkles} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle} from './ui/dialog';
import {ThemeToggle} from './theme-toggle';

export function MobileIsland({
  authenticated,
  onHistory,
  onPreserve
}: {
  authenticated?: boolean;
  onHistory?: () => void;
  onPreserve?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="mobile-island" aria-label="Mobile navigation">
        <a href="/" aria-label="Writing studio">
          <Zap size={21} />
          <span>Create</span>
        </a>
        {onHistory ? (
          <button type="button" onClick={onHistory}>
            <History size={21} />
            <span>History</span>
          </button>
        ) : (
          <a href="/tools">
            <Sparkles size={21} />
            <span>Tools</span>
          </a>
        )}
        <div className="mobile-island-theme">
          <ThemeToggle />
          <span>Theme</span>
        </div>
        <a href={authenticated ? '/dashboard' : '/auth'} onClick={onPreserve}>
          <LayoutDashboard size={21} />
          <span>{authenticated ? 'Dashboard' : '[Free] Account'}</span>
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open navigation menu"
        >
          <Menu size={21} />
          <span>Explore</span>
        </button>
      </nav>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="island-menu">
          <DialogTitle>Where next?</DialogTitle>
          <p>Good words are just the start.</p>
          <div className="island-menu-theme-row">
            <span>Appearance</span>
            <ThemeToggle showLabel />
          </div>
          <nav aria-label="More pages">
            {[
              ['/pricing', 'Plans & credits'],
              ['/examples', 'Get inspired'],
              ['/guides', 'Writing guides'],
              ['/use-cases', 'Use cases'],
              ['/dashboard', 'Your dashboard'],
              ['/auth', '[Free] Account'],
              ['/billing', 'Billing history'],
              ['/faq', 'Questions, answered'],
              ['/contact', 'Get in touch']
            ].map(([url, label]) => (
              <a href={url} key={url} onClick={onPreserve}>
                {label}
                <span>↗</span>
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="island-close"
          >
            <X size={17} /> Close menu
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

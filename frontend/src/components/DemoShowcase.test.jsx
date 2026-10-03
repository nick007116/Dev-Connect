import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import DemoShowcase from './DemoShowcase';

jest.mock('lucide-react', () => ({
  Activity: () => null,
  ArrowUpRight: () => null,
  BookOpen: () => null,
  Check: () => null,
  ChevronRight: () => null,
  Code2: () => null,
  Command: () => null,
  FileCode2: () => null,
  GitBranch: () => null,
  LayoutDashboard: () => null,
  MessageCircle: () => null,
  MonitorUp: () => null,
  MoreHorizontal: () => null,
  Plus: () => null,
  Search: () => null,
  Send: () => null,
  ShieldCheck: () => null,
  Sparkles: () => null,
  Users: () => null,
  WandSparkles: () => null
}));

describe('DemoShowcase', () => {
  let container;
  let root;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('opens the sample workspace without authentication', () => {
    act(() => root.render(<DemoShowcase />));

    expect(container.querySelector('h1').textContent).toBe('Your workspace');
    expect(container.textContent).toContain('Sample data only');
  });

  it('lets visitors browse read-only sample messages', () => {
    act(() => root.render(<DemoShowcase />));

    const messagesButton = Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent.trim() === 'Messages');
    act(() => messagesButton.dispatchEvent(new MouseEvent('click', { bubbles: true })));

    expect(container.querySelector('h1').textContent).toBe('Messages');
    expect(container.textContent).toContain('Pushed the new component API');
    expect(container.textContent).toContain('Demo preview — messaging is read-only');
  });
});

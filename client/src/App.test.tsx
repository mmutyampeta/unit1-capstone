import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import userService from './utils/userService';

vi.mock('./utils/userService', () => ({
  default: {
    getUser: vi.fn(),
    logout: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
  },
}));

function renderApp(path = '/') {
  window.history.pushState({}, '', path);
  return render(<BrowserRouter><App /></BrowserRouter>);
}

describe('Spoonful UI', () => {
  beforeEach(() => {
    vi.mocked(userService.getUser).mockReturnValue(null);
    vi.mocked(userService.login).mockReset();
    vi.mocked(userService.signup).mockReset();
    vi.mocked(userService.logout).mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('shows the public landing page and navigates to login', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole('heading', { name: 'Recipes worth sharing.' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Log in' }));

    expect(screen.getByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
  });

  it('redirects guests from the personal recipes dashboard to login', () => {
    renderApp('/recipes');

    expect(screen.getByRole('heading', { name: 'Welcome Back!' })).toBeInTheDocument();
  });

  it('shows a validation error when signup passwords do not match', async () => {
    const user = userEvent.setup();
    renderApp('/signup');

    await user.type(screen.getByLabelText('Username'), 'cook');
    await user.type(screen.getByLabelText('Email'), 'cook@example.com');
    await user.type(screen.getByLabelText('Password'), 'one-password');
    await user.type(screen.getByLabelText('Confirm password'), 'another-password');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(userService.signup).not.toHaveBeenCalled();
  });

  it('shows a service error when the AI request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'AI Assistant is unavailable.' }),
    } as Response);
    renderApp('/ai-assistant');

    await user.type(screen.getByLabelText('Your question'), 'What can I cook with lentils?');
    await user.click(screen.getByRole('button', { name: 'Ask Assistant' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('AI Assistant is unavailable.');
  });
});
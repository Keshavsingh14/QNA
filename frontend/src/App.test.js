import { render, screen } from '@testing-library/react';
import App from './App';

test('renders online code editor title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Online Code Editor/i);
  expect(titleElement).toBeInTheDocument();
});


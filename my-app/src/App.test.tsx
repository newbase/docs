import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const appImage = screen.getByAltText(/Medicrew Platform/i);
  expect(appImage).toBeInTheDocument();
});

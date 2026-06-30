import { render, screen } from '@testing-library/react';
import RC600Controller from './App';

test('renders the controller view even when Web MIDI is unavailable', () => {
  render(<RC600Controller />);

  expect(screen.getByText(/RC-600 Controller/i)).toBeInTheDocument();
});

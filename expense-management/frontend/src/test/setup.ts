import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Suppress console.error for expected errors in tests
vi.spyOn(console, 'error').mockImplementation(() => {});

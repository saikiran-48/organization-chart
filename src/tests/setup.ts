import '@testing-library/jest-dom'

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Provide a configurable clipboard polyfill to support tests that stub navigator.clipboard
try {
  const NavigatorProto = (globalThis as any).Navigator?.prototype;
  if (NavigatorProto) {
    Object.defineProperty(NavigatorProto, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: () => Promise.resolve(undefined) },
    })
  } else {
    Object.defineProperty(globalThis.navigator as any, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText: () => Promise.resolve(undefined) },
    })
  }
} catch {}
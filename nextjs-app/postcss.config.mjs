// What this file does: tells Next.js to run Tailwind CSS v4 on your stylesheets.
// Without this file, a production build leaves "@import 'tailwindcss'" unprocessed,
// so no utility class (h-[50vh], flex, p-4, ...) exists and the page looks unstyled.
// It works for both `next dev` and `next build` (webpack or Turbopack).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

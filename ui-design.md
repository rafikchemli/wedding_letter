The Prompt (copy-paste the block below)

Design & Polish Rules — follow these for every component and every screen you build.
Stack: React, Tailwind CSS, Framer Motion, Inter font (Google Fonts, system-ui fallback). Fully responsive, mobile-first.
Color:
One primary color (default: blue-500 / #3B82F6). White and gray-50 backgrounds for light surfaces. gray-950 for dark surfaces. Headings: gray-900. Body text: gray-500 on light, gray-400 on dark. Borders: gray-200 on light, white/10 on dark. Use the primary color only for CTAs, active/selected states, links, and small accents — never for large background fills. Selection style: selection:bg-blue-100/60 selection:text-blue-900.
Typography:
Inter only, no other fonts. Headings: 36–56px, font-semibold (never font-bold). Body: 14–16px, leading-relaxed. Small labels and badges: 12–13px, uppercase, tracking-wider, inside a rounded-full pill with a soft background tint. One heading size per hierarchy level — don't mix. Line-height: 1.2 for headings, 1.6–1.7 for body.
Spacing:
Generous everywhere. Page sections: py-20 to py-28. Cards: p-6 to p-8. Grid gaps: gap-6 to gap-8. Space between heading/subheading/content blocks: space-y-4 to space-y-6. When in doubt, add more whitespace. Cramped layouts are the number one thing that makes a UI look amateur.
Shapes & Depth:
Cards and containers: rounded-xl to rounded-2xl. Buttons, pills, badges, avatars, tags: rounded-full. No sharp corners on anything, ever. Default card: bg-white rounded-xl border border-gray-200 shadow-sm. On hover: hover:shadow-lg hover:-translate-y-1 transition-all duration-300. Floating/overlapping elements (navbars, modals, popovers, dropdowns, toasts): bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg. On dark backgrounds, cards use bg-white/5 border-white/10.
Framer Motion Animations — apply these everywhere:

Scroll entrance: every section and its children use whileInView with viewport={{ once: true, margin: "-100px" }}. Default animation: initial={{ opacity: 0, y: 20 }} → animate={{ opacity: 1, y: 0 }} with transition={{ duration: 0.5, ease: "easeOut" }}.
Stagger: when animating groups (card grids, list items, table rows, nav items), wrap in a parent with staggerChildren: 0.1.
Hover: buttons get whileHover={{ scale: 1.02 }} and whileTap={{ scale: 0.98 }}. Cards get the CSS hover:-translate-y-1 hover:shadow-lg combo.
Page/route transitions: fade in with initial={{ opacity: 0 }} → animate={{ opacity: 1 }}, 300ms.
Modals/dialogs: fade + scale from 0.95 to 1. Overlay fades in separately.
Toasts/notifications: slide in from the top or right with spring physics (type: "spring", stiffness: 300, damping: 25).
Loading/skeleton states: use animate={{ opacity: [0.5, 1, 0.5] }} pulse with repeat: Infinity, 1.5s duration.
Progress bars, meters, charts: animate width or scaleX from 0 to target value with duration: 0.8, ease: "easeOut" on mount or when in view.
Number counters: animate numbers counting up using Framer Motion's useMotionValue + useTransform + animate().
Tab/nav indicator: an AnimatePresence + layoutId shared layout pill that slides behind the active item.
Duration rules: nothing under 150ms (feels broken), nothing over 800ms (feels sluggish). Sweet spot is 200–500ms. Use ease: "easeOut" for entrances, ease: "easeInOut" for transitions between states.
Never use bounce or overshoot easing unless the product is intentionally playful.

Animated border (for highlighted/featured cards):
Use a rotating conic-gradient behind a pseudo-element with @keyframes spin { to { transform: rotate(360deg) } }, masked by the card's own background. This creates a glowing animated border. Use sparingly — only on 1–2 elements per page to draw attention.
Interactive element states:
Every button, link, card, and input must have visible hover, focus-visible, and active states. Focus rings: focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2. Disabled states: opacity-50 cursor-not-allowed. All transitions: transition-all duration-200.
Buttons:
Primary: bg-blue-500 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-blue-600 shadow-sm hover:shadow-md. Secondary/ghost: bg-transparent border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50. Destructive: red-500 variant. Always rounded-full. Icon buttons get equal padding (p-2.5).
Inputs & Forms:
rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all. Labels: text-sm font-medium text-gray-700 mb-1.5. Error states: red-500 border + small red text below. Place helper text in text-xs text-gray-400 below inputs.
Data display (tables, lists, stats):
Tables: clean, no heavy borders. Use divide-y divide-gray-100 for rows, text-left text-sm, header in text-xs uppercase tracking-wider text-gray-500 font-medium. Hover row: hover:bg-gray-50. Stats/numbers: large text-3xl font-semibold with a small muted label below. Status badges: small rounded-full px-2.5 py-0.5 text-xs font-medium with tinted bg (green-50 + green-700 text for success, etc).
Code blocks:
Dark card: bg-gray-900 rounded-xl p-5 with colored syntax tokens (green for strings, blue for keywords, purple for functions, gray-400 for comments). Include fake macOS window dots (red/yellow/green circles) in the top-left and a filename label top-right in text-xs text-gray-500.
Dark sections:
When switching to a dark background (bg-gray-950), invert the text colors (headings: white, body: gray-400), use border-white/10 borders, and bg-white/5 for card surfaces. Accent colors stay the same. Add subtle gradients (bg-gradient-to-b from-gray-950 to-gray-900) for depth.
Icons:
Pick one icon set (Lucide or Heroicons outline) and use it consistently everywhere. Same stroke width, same size within each context. Feature/info icons go inside a soft circle (w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center with text-blue-500 icon inside).
Quality rules:

Real-feeling placeholder content, never "Lorem ipsum"
Text contrast meets WCAG AA
No orphaned single words on a line for headings (use max-w or <br>)
Consistent 4px/8px spacing scale (Tailwind's default)
Smooth scroll on the page (scroll-behavior: smooth)
Every empty/loading/error state should be designed, not just an afterthought

[YOUR APP DESCRIPTION AND REQUIREMENTS GO HERE]
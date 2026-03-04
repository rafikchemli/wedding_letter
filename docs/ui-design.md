The Prompt (copy-paste the block below)

Design & Polish Rules — follow these for every component and every screen you build.
Stack: React, Tailwind CSS, Framer Motion, Cormorant Garamond (headings) + Lato (body) from Google Fonts. Fully responsive, mobile-first.
Theme: Romantic Blush & Sage — soft, elegant, garden-party aesthetic.
Color:
Primary accent: sage green (#8B9E7E / dark sage #5C6B4F). Blush pink (#E8C4B8) for warm accents, borders, and highlights. Cream (#FDF8F4) page background, warm white (#FFFBF7) card surfaces. Headings: #5C6B4F (dark sage). Body text: #8B9E7E on light, muted sage on dark. Helper/label text: #C4A98A (warm tan). Borders: #E8C4B8/30 on light, white/10 on dark. Use sage green only for CTAs, active/selected states, and accent icons — never for large background fills. Selection style: selection:bg-[#E8C4B8]/40 selection:text-[#5C6B4F].
Typography:
Cormorant Garamond for all headings and display text — elegant serif. Lato for body, labels, and UI text — clean sans-serif. Headings: 36–56px (hero up to 70px), font-semibold (never font-bold). Body: 14–16px, leading-relaxed. Small labels and badges: 12–13px, uppercase, tracking-wider, inside a rounded-full pill with soft sage/blush background tint. One heading size per hierarchy level — don't mix. Line-height: 1.1–1.2 for headings, 1.6–1.7 for body.
Spacing:
Generous everywhere. Page sections: py-20 to py-28. Cards: p-6 to p-8. Grid gaps: gap-6 to gap-8. Space between heading/subheading/content blocks: space-y-4 to space-y-6. When in doubt, add more whitespace. Cramped layouts are the number one thing that makes a UI look amateur.
Shapes & Depth:
Cards and containers: rounded-xl to rounded-2xl. Buttons, pills, badges, avatars, tags: rounded-full. No sharp corners on anything, ever. Default card: bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm. On hover: hover:shadow-lg hover:-translate-y-1 transition-all duration-300. Floating/overlapping elements (navbars, modals, popovers, dropdowns, toasts): bg-[#FFFBF7]/80 backdrop-blur-xl border border-[#E8C4B8]/30 shadow-lg.
Decorative elements:
Ornamental dividers: horizontal lines with a centered floral symbol (✿), using gradient lines fading to transparent. Floating petal particles: CSS-animated tear-drop shapes in blush pink, drifting slowly down the page. Decorative concentric circles on the hero section for depth. Use sparingly — elegance over excess.
Framer Motion Animations — apply these everywhere:

Scroll entrance: every section and its children use whileInView with viewport={{ once: true, margin: "-100px" }}. Default animation: initial={{ opacity: 0, y: 20 }} → animate={{ opacity: 1, y: 0 }} with transition={{ duration: 0.5, ease: "easeOut" }}.
Stagger: when animating groups (card grids, list items, table rows, nav items), wrap in a parent with staggerChildren: 0.1 or use incremental delay props.
Hover: buttons get whileHover={{ scale: 1.02 }} and whileTap={{ scale: 0.98 }}. Cards get the CSS hover:-translate-y-1 hover:shadow-lg combo.
Page/route transitions: fade in with initial={{ opacity: 0 }} → animate={{ opacity: 1 }}, 300ms.
Hero entrance: staggered reveal — text fades up, then ornament, then CTA button, then scroll hint.
Modals/dialogs: fade + scale from 0.95 to 1. Overlay fades in separately.
Toasts/notifications: slide in from the top or right with spring physics (type: "spring", stiffness: 300, damping: 25).
Loading/skeleton states: use animate={{ opacity: [0.5, 1, 0.5] }} pulse with repeat: Infinity, 1.5s duration.
Tab/nav indicator: an AnimatePresence + layoutId shared layout pill that slides behind the active item.
Duration rules: nothing under 150ms (feels broken), nothing over 800ms (feels sluggish). Sweet spot is 200–500ms. Use ease: "easeOut" for entrances, ease: "easeInOut" for transitions between states.
Never use bounce or overshoot easing — this is an elegant wedding, not a playful app.

Animated border (for highlighted/featured cards):
Use a rotating conic-gradient with sage and blush colors behind a pseudo-element with @keyframes spin { to { transform: rotate(360deg) } }, masked by the card's own background. Creates a soft glowing animated border. Use sparingly — only on 1–2 elements per page.
Interactive element states:
Every button, link, card, and input must have visible hover, focus-visible, and active states. Focus rings: focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2. Disabled states: opacity-50 cursor-not-allowed. All transitions: transition-all duration-200.
Buttons:
Primary: bg-[#8B9E7E] text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#7A8E6D] shadow-md hover:shadow-lg. Secondary/ghost: bg-transparent border border-[#E8C4B8]/40 text-[#5C6B4F] rounded-full hover:bg-[#E8C4B8]/10. Dark variant: bg-[#5C6B4F] text-white. Always rounded-full. Icon buttons get equal padding (p-2.5).
Inputs & Forms:
rounded-xl bg-[#FFFBF7] border border-[#E8C4B8]/40 px-4 py-2.5 text-sm text-[#5C6B4F] focus:border-[#8B9E7E] focus:ring-2 focus:ring-[#8B9E7E]/20 transition-all. Labels: text-sm font-medium text-[#5C6B4F] mb-1.5. Error states: red-500 border + small red text below. Helper text: text-xs text-[#C4A98A].
Quality rules:

Real-feeling placeholder content, never "Lorem ipsum"
Text contrast meets WCAG AA
No orphaned single words on a line for headings (use max-w or <br>)
Consistent 4px/8px spacing scale (Tailwind's default)
Smooth scroll on the page (scroll-behavior: smooth)
Every empty/loading/error state should be designed, not just an afterthought

[YOUR APP DESCRIPTION AND REQUIREMENTS GO HERE]

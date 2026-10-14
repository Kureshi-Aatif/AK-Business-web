import fs from 'node:fs';

let css = fs.readFileSync('public/css/style.css', 'utf8');

// Prepend fonts import
const fontImport = `@import url('/css/fonts.css');\n\n`;

// Replace floating-whatsapp styles with the orange pill button
const oldFloatingRegex = /\/\* Floating WhatsApp Button \*\/[\s\S]*?\.floating-whatsapp:hover \{[\s\S]*?\}/;
const newFloatingCss = `/* Floating Orange WhatsApp Pill Button */
.floating-whatsapp {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 990;
  background: var(--color-orange);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(255, 122, 26, 0.4);
  transition: transform var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);
  text-decoration: none;
}
.floating-whatsapp:hover {
  background: var(--color-orange-hover);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 12px 30px rgba(255, 122, 26, 0.5);
  color: #ffffff;
}
.floating-whatsapp svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .floating-whatsapp {
    bottom: 18px;
    right: 18px;
    padding: 14px 22px;
    font-size: 1rem;
    min-height: 48px;
  }
}
@media print {
  .floating-whatsapp {
    display: none !important;
  }
}`;

if (oldFloatingRegex.test(css)) {
  css = css.replace(oldFloatingRegex, newFloatingCss);
}

// Append Page Edges CSS
const pageEdgesCss = `
/* ==========================================================================
   PAGE EDGES - Viewport frames with ::before and ::after pseudo-elements
   ========================================================================== */
body[class*="pg-"]::before,
body[class*="pg-"]::after {
  content: "";
  position: fixed;
  inset: 10px;
  border-radius: 20px;
  pointer-events: none;
  z-index: 99;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  body[class*="pg-"]::before,
  body[class*="pg-"]::after {
    inset: 5px;
    border-radius: 14px;
  }
}

@media print {
  body[class*="pg-"]::before,
  body[class*="pg-"]::after {
    display: none !important;
  }
}

/* Home: thin royal border at 20% opacity plus orange corner brackets at top-left and bottom-right */
body.pg-home::before {
  border: 1.5px solid rgba(11, 63, 216, 0.2);
}
body.pg-home::after {
  background:
    linear-gradient(#FF7A1A, #FF7A1A) top left / 26px 3px no-repeat,
    linear-gradient(#FF7A1A, #FF7A1A) top left / 3px 26px no-repeat,
    linear-gradient(#FF7A1A, #FF7A1A) bottom right / 26px 3px no-repeat,
    linear-gradient(#FF7A1A, #FF7A1A) bottom right / 3px 26px no-repeat;
}

/* Why a website: dotted bright-blue lines on the left and right edges only */
body.pg-why::before {
  border-left: 2px dotted #2E6BFF;
  border-right: 2px dotted #2E6BFF;
  border-top: none;
  border-bottom: none;
  border-radius: 0;
}
body.pg-why::after {
  display: none;
}

/* Plans: a thin orange outer border plus an inner dashed royal border */
body.pg-plans::before {
  border: 1.5px solid #FF7A1A;
}
body.pg-plans::after {
  inset: 16px;
  border: 1.5px dashed rgba(11, 63, 216, 0.55);
  border-radius: 16px;
}
@media (max-width: 768px) {
  body.pg-plans::after {
    inset: 9px;
    border-radius: 11px;
  }
}

/* Services (and each service page): royal corner brackets on all four corners, no full border */
body.pg-services::before {
  display: none;
}
body.pg-services::after {
  background:
    linear-gradient(#0B3FD8, #0B3FD8) top left / 26px 3px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) top left / 3px 26px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) top right / 26px 3px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) top right / 3px 26px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) bottom left / 26px 3px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) bottom left / 3px 26px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) bottom right / 26px 3px no-repeat,
    linear-gradient(#0B3FD8, #0B3FD8) bottom right / 3px 26px no-repeat;
}

/* Portfolio: blue-to-orange gradient lines along the top and bottom edges only */
body.pg-portfolio::before {
  border-left: none;
  border-right: none;
  border-top: 2.5px solid transparent;
  border-bottom: 2.5px solid transparent;
  border-radius: 0;
  background:
    linear-gradient(90deg, #0B3FD8, #FF7A1A) top / 100% 2.5px no-repeat,
    linear-gradient(90deg, #0B3FD8, #FF7A1A) bottom / 100% 2.5px no-repeat;
}
body.pg-portfolio::after {
  display: none;
}

/* Contact: dashed bright-blue border plus bright-blue brackets at top-right and bottom-left */
body.pg-contact::before {
  border: 1.5px dashed #2E6BFF;
}
body.pg-contact::after {
  background:
    linear-gradient(#2E6BFF, #2E6BFF) top right / 26px 3px no-repeat,
    linear-gradient(#2E6BFF, #2E6BFF) top right / 3px 26px no-repeat,
    linear-gradient(#2E6BFF, #2E6BFF) bottom left / 26px 3px no-repeat,
    linear-gradient(#2E6BFF, #2E6BFF) bottom left / 3px 26px no-repeat;
}

/* Legal/404: plain thin border */
body.pg-plain::before {
  border: 1px solid var(--color-line);
}
body.pg-plain::after {
  display: none;
}

/* Portfolio Page specific embed styles */
.portfolio-gallery-card {
  background: #ffffff;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-line);
  box-shadow: var(--shadow-card);
  padding: 16px;
  overflow: hidden;
  margin: 30px auto 0;
  max-width: 1000px;
}
.portfolio-iframe {
  width: 100%;
  height: 560px;
  border: none;
  border-radius: var(--radius-lg);
  display: block;
}
.portfolio-fallback-note {
  margin-top: 14px;
  font-size: 0.92rem;
  color: var(--color-slate);
  text-align: center;
}
`;

fs.writeFileSync('assets/css/style.css', fontImport + css + pageEdgesCss);
console.log('Successfully generated assets/css/style.css');

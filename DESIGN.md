# Design Brief: Modern Premium Bakery — Light Mode + New Features

## Purpose & Tone
Clean, professional artisan bakery e-commerce. White canvases showcase product imagery. Vivid fruit-orange accents signal energy and engagement. Minimal shadows and subtle interactions let food photography be the hero. Premium, refined, never cluttered. New features layer seamlessly: promotional bar, loyalty system, coupon codes, Instagram-style galleries, WhatsApp engagement, and admin analytics.

## Color Palette (OKLCH)
| Role | Name | L | C | H | Usage |
|------|------|---|---|---|-------|
| Background | Clean White | 0.98 | 0.001 | 0 | Page and card backgrounds, maximum clarity |
| Foreground | Near Black | 0.18 | 0.01 | 264 | All text, high contrast, crisp readability |
| Card | Pure White | 0.99 | 0 | 0 | Product cards, lifted via subtle shadow |
| Primary | Vivid Orange | 0.65 | 0.22 | 38 | CTAs, badges, active states, coupons, loyalty points |
| Border | Light Grey | 0.92 | 0.003 | 0 | Dividers, input borders, soft definition |
| Muted | Medium Grey | 0.55 | 0.004 | 0 | Secondary text, disabled states |
| Destructive | Coral Red | 0.65 | 0.16 | 25 | Alerts, errors, cancellations |
| Success | Fresh Green | 0.7 | 0.15 | 150 | Wishlist saved state, completed orders, WhatsApp |

## Typography
- **Display**: Fraunces (serif) — elegant, premium for titles and product names
- **Body**: DM Sans (sans-serif) — clean, professional for UI and descriptions
- **Mono**: General Sans — forms, data, order details, coupon codes

## Elevation & Depth
Minimal, clean shadows (black 8-12% opacity) create subtle lift. Two levels: `shadow-warm` (2px, 8%), `shadow-elevated` (4px, 12%). Enhanced `hover-card` for product tiles: -8px translateY with 1.02 scale. Product images carry visual depth through composition.

## Structural Zones

| Zone | Background | Border | Treatment |
|------|------------|--------|-----------|
| Promo Bar | Vivid Orange | None | White text, sticky top, min-height 44px, icon + message + CTA |
| Product Grid | White | None | Cards `bg-card` with minimal shadow, enhanced hover-card animation |
| Product Gallery | White card | Light Grey | 4-image grid (Instagram style), thumbnail carousel, slide-vertical-in transitions |
| Coupon Section | Light Grey | Light Grey | Card-based, orange accent buttons, copy-to-clipboard CTA |
| Loyalty Points | White | Orange accent | Badge with point count, pulse-glow animation, redemption button |
| Wishlist Toggle | Transparent | None | Heart icon, success green when saved, smooth scale-in transition |
| WhatsApp Button | Gradient (Orange→Green) | None | Fixed bottom-right, float-bounce animation, icon + label |
| Admin Analytics | White | Light Grey | Charts with `--chart-*` palette, day/week/month filter tabs |
| Coupon Manager | White | Light Grey | Form inputs, orange submit button, code display with copy functionality |
| Promo Manager | White | Light Grey | Image upload area, input fields, orange save button, preview section |

## Component Patterns
- **Buttons**: Orange primary (`bg-primary`), grey secondary, smooth transitions, hover darkens primary
- **Product Cards**: White `bg-card` with minimal shadow, hover-card animation (-8px, 1.02 scale), image on top, Fraunces title
- **Coupons**: Orange badge with code, white background card, copy button in primary orange, discount % or amount in bold
- **Loyalty Points**: Card with point total in large Fraunces font, orange accent, redemption CTA in primary
- **Wishlist**: Heart icon (outline when unsaved, filled green when saved), smooth scale-in transition
- **Gallery**: 4-image grid (2×2) in product detail, thumbnail carousel below main image, slide-vertical-in on selection
- **WhatsApp Button**: Fixed bottom-right, 64px circle with white icon, orange-to-green gradient background, float-bounce animation
- **Analytics Charts**: Line/bar charts using `--chart-1` through `--chart-5`, filter tabs in muted with orange underline for active
- **Forms**: Light grey borders, near-black labels, orange focus ring, `form-input-focus` utility

## Motion & Animation
- **Fade In**: 0.4s ease-out on page load
- **Slide Up**: 0.4s cubic-bezier on scroll-into-view
- **Slide In Down**: 0.3s cubic-bezier for dropdowns
- **Scale In**: 0.3s cubic-bezier for modals and wishlist toggles
- **Hover Card**: -8px translateY, 1.02 scale, shadow-elevated, 0.3s smooth
- **Hover Lift**: -4px translateY, minimal shadow increase, 0.3s smooth
- **Pulse Glow**: 2s infinite pulse for loyalty points badge (opacity 1.0 → 0.8, shadow breathing)
- **Float Bounce**: 3s infinite vertical float for WhatsApp button
- **Slide Vertical**: 0.3s cubic-bezier for gallery thumbnail transitions
- **Transitions**: `transition-smooth` 0.3s on all interactive elements

## Signature Details
- **Promotional Bar**: Sticky, full-width, vivid orange, conveys urgency and special offers
- **Animated Product Cards**: Hover-card effect creates dynamic, interactive storefront experience
- **Loyalty Points Badge**: Pulse-glow animation subtly draws attention to engagement system
- **Instagram Gallery**: 4-image carousel with thumbnail navigation matches modern social expectations
- **WhatsApp Integration**: Floating button with float-bounce animation encourages customer contact
- **Coupon Display**: Prominent orange badges with copy functionality reduce friction for code entry
- **Admin Analytics**: Day/week/month filters empower merchants with flexible reporting

## Constraints
- Background always white (`oklch(0.98 0.001 0)`), never cream or off-white
- Foreground always near-black (`oklch(0.18 0.01 264)`), never dark grey
- Primary orange (`oklch(0.65 0.22 38)`) used consistently for all CTAs and engagement elements
- Shadows black-based only, no warm or color tints
- Minimal box-shadows (2–4px, 8–12% opacity) for clarity
- All text pairs must meet WCAG AA contrast (≥4.5:1 for body, ≥3:1 for large)
- Product imagery as primary depth carrier — avoid decorative effects
- Hover animations maximum -8px translateY, scale ≤1.05 to maintain professional appearance
- Dark mode inherits all structural zones with adjusted token values (already defined in index.css)

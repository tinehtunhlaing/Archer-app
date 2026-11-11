---
name: burmese-i18n
description: Implement or review Burmese and English localization with locale-specific typography, layout, and language-aware UI behavior.
---

# Burmese i18n for Archer

Use this skill when changing Archer's English and Burmese interface, translations, or components that display Burmese text.

## Language-aware typography

- Treat English and Burmese as separate typography systems. Select styles from the active UI locale instead of applying one compact text style to both languages.
- Use the existing locale state and document language (`en` or `my-MM`) as the source for locale-specific styles. Keep the document `lang` synchronized when the user switches language; do not infer the selected UI language from the text content.
- Give Burmese glyphs and combining marks enough vertical room. Prefer the font's natural line box (`line-height: normal`) or a roomier Burmese-specific line-height. Avoid tight fixed pixel line-heights for Burmese. If a component needs an explicit line-height, define it separately for Burmese and inspect it at actual rendered sizes.
- Apply locale-specific font families only after checking the app's current font stack and Myanmar script coverage. Preserve sensible fallbacks; do not assume an English font renders Burmese well.
- Allow text containers, buttons, navigation, cards, and form controls to grow with translated text. Avoid fixed heights, clipping, and truncation for Burmese labels or paragraphs unless truncation is an intentional product behavior.
- Keep typographic choices locale-aware where needed, including font size, weight, and spacing around text. Do not apply custom letter spacing or tracking to Burmese text; use normal letter spacing. Tune English letter spacing independently when the design calls for it.

## Mixed-language and authored content

- Do not translate every English term in Burmese UI copy. Keep familiar technical vocabulary and widely recognized UI terms in English when that is clearer and more natural for users. Translate the surrounding copy into Burmese, and avoid awkward literal translations or inconsistent spelling of retained terms.
- Use established Archer wording consistently. When a term's translation is uncertain or could confuse users, retain the English term rather than inventing a Burmese equivalent; apply the same choice across related screens.
- The selected locale controls Archer's interface typography and translations. User-authored job, profile, proposal, and message text remains in the language in which it was written; do not translate it as part of UI localization.
- When a content language is known, expose it with an appropriate `lang` attribute and use typography that can render that script. When it is unknown or mixed, retain Myanmar-capable fallbacks and enough line-box space for Burmese marks.
- Do not force all text inside a Burmese-selected page to use Burmese glyph styling when the content itself is known to be English. Prefer scoped locale styles for interface text and content-language styles for authored text where the distinction matters.

## Workflow

- Before changing app behavior or styling, read the applicable `SPEC.md` and `app/README.md`, then inspect the existing i18n provider, global styles, font setup, and component conventions.
- Keep translations in the existing locale resources and use the existing locale selector and persistence behavior. Do not introduce another i18n framework or change locale codes without an explicit product decision.
- Implement locale styles at a shared, maintainable boundary (for example, a root locale attribute/class with CSS variables or locale-scoped selectors), then make targeted component overrides only where the shared rules are insufficient.
- Review representative screens in both English and Burmese, including dense text, wrapped labels, forms, buttons, navigation, and user-authored content. Check that glyph marks are not clipped and that the Burmese layout remains usable at narrow widths.

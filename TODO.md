# Universal Dessert Fix Plan (All Languages)

**Information Gathered:**
Current LV logic breaks EN (empty variants → broken labels)
RU/UK hardcoded but inconsistent
API dessert data language-inconsistent

**Plan:**
1. Language-independent grouping: baklavaItems vs iceCreamItems using all-field keywords
2. Build variants from actual found items or language fallbacks  
3. Exactly 2 cards ALL languages: Baklava (2 variants) + Ice Cream (2 variants)
4. UI identical to kebabs everywhere

**Details:**
BAKLAWA keywords: 'baklava', 'баклава'
ICE CREAM keywords: 'ice', 'saldēj', 'морож', 'мороз', 'vanil', 'ванил', 'шокол'
MUTUALLY EXCLUSIVE groups

Fallback labels per lang (variantName empty → use fallback)

**Dependent Files:** MenuSection.tsx (groupedByCategory useMemo)

**Followup:** Test all 4 langs → git commit → deploy

✅ Approved - implementing universal dessert grouping + fallbacks

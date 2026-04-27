# MenuSection.tsx Dessert Variants UI Improvement - In Progress

**Current Status:**
✅ 2 dessert cards (Baklava, Saldējums)
❌ Variant buttons missing (Klasiskā/Ar saldējumu, Vaniļa/Šokolāde)
❌ No price display in buttons

**Approved Plan Steps:**
1. Create unified `variants[]` array in all MenuCardGroup (kebabs + desserts)
2. MenuCard: selectedVariant state, render buttons `{name — price €}` yellow active
3. Update price badge/desc/image on toggle

**Next:**
- [x] Edit MenuSection.tsx with variants logic
- [x] Test HMR localhost:8080/#menu Deserti
- [ ] ✅ Complete


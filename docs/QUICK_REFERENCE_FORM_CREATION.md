# Quick Reference: Form Creation UX

## 🎯 TL;DR

- **All tabs accessible immediately** - No save required to switch tabs
- **Save button always visible** - Top right corner, in header
- **Can customize unsaved form** - If title exists, customization works
- **Auto-save in customization** - Changes auto-save when form has title
- **Manual save for questions** - Must click Save button to persist questions
- **Title required** - Must have title to save or publish

---

## 📍 Save Button Location

**Position:** Top right corner (always visible)
- Next to Cancel button
- Visible in all tabs
- Full width on mobile, auto on desktop

**Requirements:**
- ✅ Title must be filled (button disabled if empty)
- ❌ Questions optional
- ❌ Sections optional

---

## 🔄 Tab Access & Behavior

### Questions Tab
- ✅ Accessible immediately
- ❌ No auto-save (manual save required)
- ✅ Can add questions before saving
- ✅ Live preview updates in real-time

### Customization Tab
- ✅ Accessible immediately
- ✅ Auto-saves when form has title
- ⚠️ Requires title to show customization UI
- ✅ Can customize before saving (if title exists)

### Publish Tab
- ✅ Accessible immediately
- ✅ Auto-saves when publishing (if title exists)
- ⚠️ Requires saved form for QR code
- ⚠️ Requires published status for QR code

---

## ⚠️ Key Constraints

| Action | Requirement | Behavior if Missing |
|--------|-------------|---------------------|
| **Save** | Title required | Button disabled |
| **Customize** | Title required | Shows message to add title |
| **Publish** | Title required | Auto-saves first |
| **QR Code** | Form saved + Published | Button disabled, shows message |
| **Preview** | Form saved | Shows error if not saved |

---

## 🎬 Typical Workflows

### Workflow 1: Quick & Simple
1. Add title → Add questions → Click Save
2. Switch to Customization → Style form
3. Switch to Publish → Publish → Generate QR

**Saves:** 1 manual

### Workflow 2: Explore First
1. Add questions (no title yet)
2. Switch to Customization (sees message)
3. Go back, add title
4. Switch to Customization (auto-saves)
5. Switch to Publish → Publish

**Saves:** 0 (all auto-saved)

### Workflow 3: Iterative
1. Add title + questions → Save
2. Customize → Save
3. Add more questions → Save
4. Publish

**Saves:** 3+ (iterative)

---

## 💡 UX Issues & Recommendations

### Current Issues
1. ❌ **Inconsistent save behavior** - Customization auto-saves, questions don't
2. ❌ **No draft persistence** - Data lost if browser closes
3. ⚠️ **Save button not prominent** - Could be missed
4. ⚠️ **Title requirement not obvious** - Only shows when trying to save

### Recommendations
1. ✅ Add auto-save for questions (on tab switch or blur)
2. ✅ Add localStorage backup for drafts
3. ✅ Add "Unsaved changes" indicator
4. ✅ Show title requirement warning in Questions tab
5. ✅ Add last saved timestamp

---

## 📊 UX Score: 7.5/10

**Strengths:**
- Flexible, non-linear workflow
- Auto-save reduces friction
- Clear feedback

**Weaknesses:**
- Inconsistent save behavior
- No draft persistence
- Save button could be more prominent

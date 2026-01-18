# User Flow: Creating a New Form

## Overview
This document describes the complete user experience flow for creating a new form, from initial entry through question creation, customization, and publishing.

---

## 🎯 Entry Point

**Route:** `/dashboard/forms/new`

**Initial State:**
- User is authenticated
- Form ID: `undefined` (not yet created in database)
- All tabs are accessible immediately
- Form data exists only in component state (not persisted)

---

## 📋 Tab Structure

The form editor has **3 tabs** accessible from the start:

1. **Questions** (Default tab) - Create questions and sections
2. **Personnalisation** (Customization) - Style and appearance settings
3. **Publier & QR** (Publish & QR) - Publishing and sharing options

---

## 🔄 Complete User Flow

### **PHASE 1: Questions Tab (Default)**

#### Step 1.1: Initial View
- **Location:** Questions tab (active by default)
- **UI Elements:**
  - Header: "Créer un nouveau formulaire"
  - Save button (top right) - Always visible
  - Cancel button (top right)
  - Two-column layout:
    - **Left:** Form details + Questions/Sections editor
    - **Right:** Live preview

#### Step 1.2: Adding Form Details
- **Required:** Title field (marked with *)
- **Optional:** Description field
- **Behavior:** 
  - Title is required for saving
  - Can switch tabs without title (but can't save)

#### Step 1.3: Creating Questions
- **Actions Available:**
  - Add Section button
  - Add Question button
  - Edit/Delete existing questions
  - Reorder questions
  - Assign questions to sections

#### Step 1.4: Live Preview
- **Location:** Right column
- **Updates:** Real-time as user adds questions
- **Shows:** Exact preview matching final form UI

#### Step 1.5: Save Button Behavior
- **Location:** Top right corner (always visible)
- **Requirements:**
  - ✅ Title must be filled
  - ❌ Questions are optional (can save empty form)
  - ❌ Sections are optional
- **On Click:**
  1. Validates title exists
  2. Creates form in database
  3. Creates sections (if any)
  4. Creates questions (if any)
  5. Shows success toast
  6. Refreshes page (form now has ID)

---

### **PHASE 2: Customization Tab**

#### Step 2.1: Accessing Customization
- **Action:** Click "Personnalisation" tab
- **Accessibility:** ✅ Available immediately (no save required)
- **State:** Form may be unsaved (no ID yet)

#### Step 2.2: Draft Form Handling
- **If Form Has No Title:**
  - Shows message: "Ajoutez un titre à votre formulaire pour commencer la personnalisation"
  - Customization options are hidden
  - User must go back to Questions tab to add title

- **If Form Has Title (But Not Saved):**
  - ✅ Customization UI is visible
  - ✅ Can modify all settings
  - ⚠️ Shows message: "Les modifications seront enregistrées automatiquement"
  - **Auto-save behavior:** When user makes changes, form auto-saves

#### Step 2.3: Customization Options Available
- Theme (light/dark/auto)
- Layout (centered/wide/full)
- Colors (primary, background, button)
- Font family
- Button style
- Progress bar toggle
- Company branding (logo, name, contact info)
- Website URL

#### Step 2.4: Saving Customization
- **If Form Not Saved:**
  - Auto-saves when changes are made
  - Calls `onSave()` function
  - Creates form in database
  - Refreshes page

- **If Form Already Saved:**
  - Saves directly to database
  - No auto-save needed
  - Updates existing form

---

### **PHASE 3: Publish & QR Tab**

#### Step 3.1: Accessing Publish Tab
- **Action:** Click "Publier & QR" tab
- **Accessibility:** ✅ Available immediately (no save required)
- **State:** Form may be unsaved (no ID yet)

#### Step 3.2: Publish Tab Content
- **Status Section:**
  - Current status badge (Draft/Published)
  - Status dropdown (Draft ↔ Published)
  - Form URL (read-only, copyable)
  - Preview button
  - Open button

- **QR Code Section:**
  - Generate QR code button
  - Usage instructions

- **Form Info Section:**
  - Title, slug, description display

#### Step 3.3: Publishing Unsaved Form
- **Scenario:** User tries to change status to "Published" before saving
- **Behavior:**
  1. System checks if form has title
  2. If no title: Shows error "Veuillez d'abord ajouter un titre au formulaire"
  3. If has title: Auto-saves form first
  4. After save: Refreshes page
  5. User can then publish

#### Step 3.4: QR Code Generation
- **Requirements:**
  - ✅ Form must be saved (have ID)
  - ✅ Form must be published (status = "published")
- **If Requirements Not Met:**
  - Button is disabled
  - Shows message explaining requirement

#### Step 3.5: Preview & Open
- **Preview Button:**
  - Opens form in new tab
  - Only works if form is saved
  - Shows error if form not saved

- **Open Button:**
  - Same as preview
  - Opens public form URL

---

## 🎛️ Save Button Details

### **Location**
- **Position:** Top right corner of the editor
- **Visibility:** Always visible (all tabs)
- **Layout:** Next to Cancel button
- **Responsive:** Full width on mobile, auto width on desktop

### **Behavior**

#### When Form is Unsaved:
- **Enabled:** Only if title is filled
- **Disabled:** If title is empty
- **Action:** Creates form + sections + questions in database
- **After Save:** 
  - Shows success toast
  - Refreshes page
  - Form now has ID
  - All tabs now work with saved form

#### When Form is Saved:
- **Enabled:** Always
- **Action:** Updates form + sections + questions
- **After Save:**
  - Shows success toast
  - Refreshes page
  - Updates are persisted

### **Save Requirements**
| Element | Required for Save? | Notes |
|---------|-------------------|-------|
| Title | ✅ Yes | Must be non-empty |
| Description | ❌ No | Optional |
| Questions | ❌ No | Can save empty form |
| Sections | ❌ No | Can save form without sections |

---

## ⚠️ Constraints & Requirements

### **Customization Tab Constraints**

1. **Title Required:**
   - Customization UI only shows if form has title
   - If no title: Shows message to add title first
   - User must go to Questions tab to add title

2. **Auto-Save Behavior:**
   - If form is unsaved (no ID) and user makes customization changes
   - System auto-saves the form
   - This creates the form in database
   - User doesn't need to manually click Save button

3. **Form ID Required:**
   - Some customization features require form to be saved
   - FormSettings component checks for `form.id`
   - If no ID, shows message

### **Publish Tab Constraints**

1. **Title Required for Publishing:**
   - Cannot publish form without title
   - System auto-saves if title exists
   - Shows error if no title

2. **Form ID Required for:**
   - QR code generation
   - Preview/Open buttons
   - Status changes (after initial save)

3. **Publishing Requirements:**
   - Form must be saved (have ID)
   - Status can be changed to "published" after save
   - QR code only works for published forms

---

## 🔄 State Management

### **Component State (UnifiedFormEditor)**
- `title`: Form title (from input)
- `description`: Form description (from input)
- `questions`: Array of questions (in-memory)
- `sections`: Array of sections (in-memory)
- `isSaving`: Loading state
- `currentFormId`: Form ID (undefined until saved)
- `currentForm`: Full form object (null until saved)

### **Draft Form Object**
- Created when form is unsaved
- Uses current title/description from state
- Generates slug from title
- All customization fields default to null
- Used to populate customization and publish tabs

### **Persistence**
- **Before Save:** All data in component state only
- **After Save:** Data persisted to database
- **After Refresh:** Data loaded from database

---

## 📊 User Experience Assessment

### ✅ **Strengths**

1. **Flexible Workflow:**
   - Users can switch tabs freely
   - No forced linear progression
   - Can customize before saving

2. **Auto-Save:**
   - Reduces friction
   - Customization auto-saves
   - Publishing auto-saves

3. **Clear Feedback:**
   - Toast messages for all actions
   - Disabled states with explanations
   - Helpful error messages

4. **Live Preview:**
   - Real-time updates
   - Matches final form exactly
   - Helps users understand result

5. **Accessible Tabs:**
   - All tabs available from start
   - No artificial barriers
   - Progressive enhancement

### ⚠️ **Potential Issues**

1. **Save Button Location:**
   - **Issue:** Save button is in header, not tab-specific
   - **Impact:** Users might not realize they need to save
   - **Mitigation:** Auto-save helps, but manual save still needed for questions

2. **Title Requirement:**
   - **Issue:** Title required but not enforced until save
   - **Impact:** Users might add questions before title
   - **Current Behavior:** Save button disabled until title added
   - **Suggestion:** Could show warning in Questions tab if no title

3. **Auto-Save Confusion:**
   - **Issue:** Auto-save happens in customization but not questions
   - **Impact:** Inconsistent behavior
   - **Current:** Customization auto-saves, questions require manual save
   - **Suggestion:** Could auto-save questions too, or make it consistent

4. **Draft Form Limitations:**
   - **Issue:** Some features require saved form
   - **Impact:** Users might try to use features that don't work yet
   - **Current:** Shows messages explaining requirements
   - **Suggestion:** Could disable features with tooltips

5. **No Draft Persistence:**
   - **Issue:** If user closes browser before saving, work is lost
   - **Impact:** Data loss risk
   - **Suggestion:** Could add localStorage backup or auto-save on blur

### 💡 **Recommendations**

1. **Add Auto-Save for Questions:**
   - Auto-save questions when user switches tabs
   - Reduces risk of data loss
   - Makes behavior consistent

2. **Improve Save Button Visibility:**
   - Add save indicator when form has unsaved changes
   - Show "Unsaved changes" badge
   - Make save button more prominent

3. **Add Title Validation:**
   - Show warning in Questions tab if no title
   - Highlight title field if empty
   - Prevent tab switching if title required (optional)

4. **Add Draft Persistence:**
   - Save to localStorage on changes
   - Restore on page load
   - Clear after successful save

5. **Improve Status Indicators:**
   - Show "Draft" badge in header
   - Show "Unsaved" indicator
   - Show last saved time

---

## 🎬 Typical User Journey

### **Journey 1: Quick Form Creation**
1. User lands on Questions tab
2. Enters title immediately
3. Adds a few questions
4. Clicks Save button
5. Switches to Customization tab
6. Applies styling
7. Switches to Publish tab
8. Publishes form
9. Generates QR code

**Time:** ~5-10 minutes
**Save Clicks:** 1 (manual)

### **Journey 2: Explore Before Committing**
1. User lands on Questions tab
2. Adds questions without title
3. Switches to Customization tab (sees message about title)
4. Goes back to Questions tab
5. Adds title
6. Switches to Customization tab
7. Makes changes (auto-saves)
8. Switches to Publish tab
9. Publishes (already saved from customization)

**Time:** ~10-15 minutes
**Save Clicks:** 0 (all auto-saved)

### **Journey 3: Iterative Design**
1. User adds title and questions
2. Saves manually
3. Switches to Customization
4. Tries different styles
5. Switches to Questions
6. Adds more questions
7. Saves again
8. Switches to Publish
9. Publishes

**Time:** ~15-20 minutes
**Save Clicks:** 2+ (iterative)

---

## 📝 Summary

### **Key Points:**
- ✅ All tabs accessible from start
- ✅ Can customize unsaved form (with title)
- ✅ Auto-save in customization tab
- ✅ Manual save required for questions
- ✅ Save button always visible in header
- ✅ Title required for save
- ✅ Questions optional for save
- ⚠️ Some features require saved form
- ⚠️ No draft persistence (data loss risk)

### **Overall UX Rating: 7.5/10**

**Strengths:**
- Flexible, non-linear workflow
- Auto-save reduces friction
- Clear feedback and messages

**Weaknesses:**
- Inconsistent save behavior
- No draft persistence
- Save button could be more prominent
- Some confusion about when save is needed

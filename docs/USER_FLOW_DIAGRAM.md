# User Flow Diagram: Form Creation

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────┐
│                    ENTRY: /dashboard/forms/new               │
│                                                              │
│  State: formId = undefined, form = null                    │
│  All tabs accessible immediately                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Unified Form Editor              │
        │   ┌─────────────────────────┐    │
        │   │ [Save] [Cancel]         │    │
        │   └─────────────────────────┘    │
        │   ┌─────────────────────────┐    │
        │   │ [Questions] [Custom]    │    │
        │   │ [Publish]               │    │
        │   └─────────────────────────┘    │
        └───────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  QUESTIONS   │   │CUSTOMIZATION│   │   PUBLISH   │
│     TAB      │   │     TAB     │   │     TAB     │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Detailed Flow: Questions Tab

```
QUESTIONS TAB (Default)
│
├─► User sees empty form
│   ├─ Left: Form details + Question editor
│   └─ Right: Live preview
│
├─► User adds TITLE (required for save)
│   └─ Save button becomes enabled
│
├─► User adds DESCRIPTION (optional)
│
├─► User adds QUESTIONS (optional)
│   ├─ Can add sections
│   ├─ Can add questions
│   ├─ Can assign questions to sections
│   └─ Preview updates in real-time
│
└─► User clicks SAVE
    ├─ Validates: Title exists?
    │   ├─ NO → Shows error toast
    │   └─ YES → Continues
    ├─ Creates form in database
    ├─ Creates sections (if any)
    ├─ Creates questions (if any)
    ├─ Shows success toast
    └─ Refreshes page (form now has ID)
```

## Detailed Flow: Customization Tab

```
CUSTOMIZATION TAB
│
├─► User clicks "Personnalisation" tab
│
├─► System checks: Does form have title?
│   │
│   ├─ NO TITLE
│   │   └─ Shows message:
│   │       "Ajoutez un titre à votre formulaire..."
│   │       Customization UI hidden
│   │
│   └─ HAS TITLE
│       ├─ Form NOT saved (no ID)
│       │   ├─ Shows customization UI
│       │   ├─ Shows message: "Les modifications seront
│       │   │   enregistrées automatiquement"
│       │   └─ User makes changes
│       │       └─ AUTO-SAVES (creates form)
│       │
│       └─ Form SAVED (has ID)
│           ├─ Shows customization UI
│           └─ User makes changes
│               └─ Saves directly to database
```

## Detailed Flow: Publish Tab

```
PUBLISH TAB
│
├─► User clicks "Publier & QR" tab
│
├─► Shows publish interface
│   ├─ Status section
│   ├─ QR code section
│   └─ Form info section
│
├─► User tries to PUBLISH
│   │
│   ├─ Form NOT saved (no ID)
│   │   ├─ Checks: Has title?
│   │   │   ├─ NO → Error: "Veuillez d'abord
│   │   │   │   ajouter un titre..."
│   │   │   └─ YES → AUTO-SAVES form
│   │   │       └─ Refreshes page
│   │   │           └─ User can now publish
│   │   │
│   └─ Form SAVED (has ID)
│       └─ Updates status to "published"
│
├─► User tries to GENERATE QR CODE
│   │
│   ├─ Form NOT saved OR NOT published
│   │   └─ Button disabled
│   │       └─ Shows message explaining requirement
│   │
│   └─ Form SAVED AND published
│       └─ Generates QR code PDF
│
└─► User tries to PREVIEW/OPEN
    │
    ├─ Form NOT saved
    │   └─ Shows error: "Le formulaire doit être
    │       enregistré..."
    │
    └─ Form SAVED
        └─ Opens form in new tab
```

## Save Button Flow

```
SAVE BUTTON (Always visible in header)
│
├─► State: Form NOT saved
│   │
│   ├─ Title empty?
│   │   └─ YES → Button DISABLED
│   │
│   └─ Title filled?
│       └─ YES → Button ENABLED
│           └─ On click:
│               ├─ Creates form
│               ├─ Creates sections
│               ├─ Creates questions
│               └─ Refreshes (form now has ID)
│
└─► State: Form SAVED
    │
    └─ Button always ENABLED
        └─ On click:
            ├─ Updates form
            ├─ Updates sections
            ├─ Updates questions
            └─ Refreshes
```

## Decision Tree: Can User Customize?

```
Can user customize unsaved form?
│
├─► Does form have TITLE?
│   │
│   ├─ NO
│   │   └─ ❌ NO
│   │       └─ Shows message to add title first
│   │
│   └─ YES
│       └─ ✅ YES
│           ├─ Customization UI visible
│           ├─ Can make changes
│           └─ Changes AUTO-SAVE
│               └─ Creates form in database
```

## Decision Tree: Can User Publish?

```
Can user publish unsaved form?
│
├─► Does form have TITLE?
│   │
│   ├─ NO
│   │   └─ ❌ NO
│   │       └─ Error: "Veuillez d'abord ajouter un titre..."
│   │
│   └─ YES
│       └─ ✅ YES (with auto-save)
│           ├─ System auto-saves form
│           ├─ Refreshes page
│           └─ User can then publish
```

## State Transitions

```
┌─────────────┐
│  UNSAVED    │  formId = undefined
│  (Draft)    │  form = null
└──────┬──────┘
       │
       │ User clicks SAVE
       │ (with title)
       │
       ▼
┌─────────────┐
│   SAVED     │  formId = "abc123"
│  (Draft)    │  form = { ... }
└──────┬──────┘
       │
       │ User changes status
       │ to "published"
       │
       ▼
┌─────────────┐
│ PUBLISHED   │  formId = "abc123"
│             │  status = "published"
└─────────────┘
```

## Tab Accessibility Matrix

| Tab | Accessible Without Save? | Requirements | Auto-Save? |
|-----|-------------------------|--------------|------------|
| **Questions** | ✅ Yes | None | ❌ No (manual save) |
| **Customization** | ✅ Yes | Title required | ✅ Yes (on change) |
| **Publish** | ✅ Yes | Title for publish | ✅ Yes (on publish) |

## Feature Availability Matrix

| Feature | Unsaved Form | Saved Form (Draft) | Published Form |
|---------|--------------|-------------------|----------------|
| Add questions | ✅ | ✅ | ✅ |
| Customize style | ✅* | ✅ | ✅ |
| Change status | ✅** | ✅ | ✅ |
| Generate QR | ❌ | ❌ | ✅ |
| Preview form | ❌ | ✅ | ✅ |
| Copy URL | ✅*** | ✅ | ✅ |

*Requires title
**Auto-saves first
***Shows preview URL (not functional until saved)

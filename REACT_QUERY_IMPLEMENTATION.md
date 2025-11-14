# React Query Optimistic Updates Implementation

## 🚀 Overview

This implementation adds **React Query with Optimistic Updates** to boost performance for four critical operations:

1. **Course Deletion** ✅
2. **Material Deletion** ✅
3. **Bookmark Toggle** ✅
4. **DLC Unlinking** ✅

## 📁 File Structure

```
src/
├── hooks/
│   ├── mutations/
│   │   ├── index.ts                      # Export all mutations
│   │   ├── useCourseOperations.ts        # Course delete & DLC unlink
│   │   ├── useMaterialOperations.ts      # Material delete
│   │   └── useBookmarkOperations.ts      # Bookmark toggle
│   └── queries/
│       ├── index.ts                      # Export query utilities
│       └── queryKeys.ts                  # Centralized query keys
└── App.tsx                               # QueryClient configuration
```

## 🎯 What is Optimistic Update?

**Before Optimistic Updates:**

```
User clicks delete → Wait for server → UI updates
❌ Slow, poor UX
```

**After Optimistic Updates:**

```
User clicks delete → UI updates INSTANTLY → Server confirms in background
✅ Fast, excellent UX
```

If the server fails, the change automatically rolls back!

---

## 📚 Implementation Details

### 1️⃣ **Course Deletion**

**File:** `src/hooks/mutations/useCourseOperations.ts`

```typescript
import { useDeleteCourse } from "@/hooks/mutations/useCourseOperations";

// In component:
const deleteMutation = useDeleteCourse();

// Delete course with instant UI update
deleteMutation.mutate(courseId, {
  onSuccess: () => {
    // Custom success handling
  },
});
```

**What it does:**

- Removes course from UI **instantly**
- Updates all related queries (lists, paginated results)
- If server fails, automatically restores the course
- Shows success/error toast notifications

---

### 2️⃣ **Material Deletion**

**File:** `src/hooks/mutations/useMaterialOperations.ts`

```typescript
import { useDeleteMaterial } from "@/hooks/mutations/useMaterialOperations";

// In component:
const deleteMutation = useDeleteMaterial();

// Delete material with instant UI update
deleteMutation.mutate(materialId);
```

**What it does:**

- Removes material from all lists (recent, recommendations, uploads)
- Updates instantly across the entire app
- Also invalidates bookmark cache (materials might be bookmarked)
- Automatic rollback on failure

---

### 3️⃣ **Bookmark Toggle**

**File:** `src/hooks/mutations/useBookmarkOperations.ts`

```typescript
import { useToggleBookmark } from "@/hooks/mutations/useBookmarkOperations";

// In component:
const toggleMutation = useToggleBookmark();

// Get current bookmark state
const bookmarks = useBookmarks();
const currentBookmark = bookmarks.find((b) => b.materialId === materialId);

// Toggle bookmark with instant feedback
toggleMutation.mutate({
  materialId,
  bookmarkId: currentBookmark?.id, // undefined if not bookmarked
});
```

**What it does:**

- Toggles bookmark icon **instantly**
- Adds/removes from bookmarks list immediately
- Server confirms in background
- Automatic rollback on network failure

---

### 4️⃣ **DLC Unlinking**

**File:** `src/hooks/mutations/useCourseOperations.ts`

```typescript
import { useUnlinkDLC } from "@/hooks/mutations/useCourseOperations";

// In component:
const unlinkMutation = useUnlinkDLC();

// Unlink course from department
unlinkMutation.mutate({
  departmentId,
  courseId,
});
```

**What it does:**

- Removes department link from course **instantly**
- Updates course detail view immediately
- Updates DLC review list
- Automatic rollback on failure

---

## 🔑 Query Keys Strategy

**File:** `src/hooks/queries/queryKeys.ts`

Centralized query keys ensure consistent cache invalidation:

```typescript
export const queryKeys = {
  courses: {
    all: ["courses"],
    lists: () => ["courses", "list"],
    list: (filters) => ["courses", "list", filters],
    detail: (id) => ["courses", "detail", id],
  },
  materials: {
    all: ["materials"],
    recent: () => ["materials", "recent"],
    userUploads: (userId) => ["materials", "uploads", userId],
  },
  bookmarks: {
    all: ["bookmarks"],
    list: () => ["bookmarks", "list"],
  },
  dlc: {
    all: ["dlc"],
    list: (filters) => ["dlc", "list", filters],
  },
};
```

---

## ⚙️ Configuration

**File:** `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min fresh
      gcTime: 1000 * 60 * 10, // 10 min cache
      refetchOnWindowFocus: false, // Don't refetch on focus
      retry: 1, // Retry once on failure
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});
```

---

## 🔄 Cache Invalidation Strategy

### Course Deletion:

- Invalidates: `queryKeys.courses.all`
- Affects: Course lists, paginated results, detail views

### Material Deletion:

- Invalidates: `queryKeys.materials.all`, `queryKeys.bookmarks.all`
- Affects: Material lists, recent, recommendations, uploads, bookmarks

### Bookmark Toggle:

- Invalidates: `queryKeys.bookmarks.all`
- Affects: Bookmark lists, saved materials

### DLC Unlinking:

- Invalidates: `queryKeys.courses.detail(id)`, `queryKeys.dlc.all`
- Affects: Course details, DLC lists

---

## ✅ Benefits

1. **⚡ Lightning Fast UX** - No waiting for server responses
2. **🔄 Automatic Rollback** - Changes revert on failure
3. **📦 Smart Caching** - Reduces API calls
4. **🎯 Consistent State** - Centralized query keys
5. **🛡️ Error Resilient** - Graceful failure handling

---

## 🧪 Testing

```typescript
// Test course deletion
const { mutate } = useDeleteCourse();
mutate("course-id-123");
// UI updates instantly, server confirms in background

// Test bookmark toggle
const { mutate } = useToggleBookmark();
mutate({ materialId: "mat-id-456" });
// Bookmark icon toggles instantly

// Test material deletion
const { mutate } = useDeleteMaterial();
mutate("material-id-789");
// Material disappears from all lists instantly

// Test DLC unlinking
const { mutate } = useUnlinkDLC();
mutate({ departmentId: "dept-1", courseId: "course-2" });
// Link removed instantly from UI
```

---

## 📖 Usage Examples

### Example 1: Delete Course Button

```typescript
import { useDeleteCourse } from "@/hooks/mutations";

const CourseCard = ({ course }) => {
  const deleteMutation = useDeleteCourse();

  const handleDelete = () => {
    deleteMutation.mutate(course.id, {
      onSuccess: () => {
        console.log("Course deleted!");
      },
    });
  };

  return (
    <button onClick={handleDelete} disabled={deleteMutation.isPending}>
      {deleteMutation.isPending ? "Deleting..." : "Delete"}
    </button>
  );
};
```

### Example 2: Bookmark Toggle

```typescript
import { useToggleBookmark } from "@/hooks/mutations";
import { useBookmarks } from "@/context/bookmark/BookmarkContextProvider";

const MaterialCard = ({ material }) => {
  const { bookmarks } = useBookmarks();
  const toggleMutation = useToggleBookmark();

  const currentBookmark = bookmarks.find((b) => b.materialId === material.id);
  const isBookmarked = !!currentBookmark;

  const handleToggle = () => {
    toggleMutation.mutate({
      materialId: material.id,
      bookmarkId: currentBookmark?.id,
    });
  };

  return (
    <button onClick={handleToggle}>
      {isBookmarked ? "❤️ Saved" : "🤍 Save"}
    </button>
  );
};
```

---

## 🚨 Important Notes

1. **Always use mutation hooks** instead of calling API functions directly
2. **Query keys must be consistent** across the app
3. **Optimistic updates auto-rollback** on errors
4. **Toast notifications** are built-in
5. **Cache invalidation** is automatic

---

## 🔧 Troubleshooting

### Issue: "Changes don't persist"

**Solution:** Check if `onSettled` is invalidating correct query keys

### Issue: "Mutation is slow"

**Solution:** Ensure you're using the mutation hook, not direct API calls

### Issue: "UI doesn't update"

**Solution:** Verify query keys match between queries and mutations

---

## 📝 Future Enhancements

- [ ] Add blog deletion optimistic update
- [ ] Add user deletion optimistic update
- [ ] Add collection operations optimistic updates
- [ ] Add infinite scroll for paginated data
- [ ] Add React Query DevTools in development

---

**Created by:** AI Assistant
**Date:** November 11, 2025
**Status:** ✅ Fully Implemented & Production Ready

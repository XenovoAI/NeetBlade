# Routing and Test Attempt Fixes

## Issues Fixed

### 1. Routing Issue - testId undefined
**Problem**: The TestInterface component was receiving `testId` as `undefined` due to routing parameter extraction issues.

**Solution**: 
- Used state-based testId extraction with multiple fallback methods
- Added useEffect to update testId when params change
- Implemented manual URL parsing as fallback
- Added proper timing for route parameter availability

### 2. "Active Attempt" Error
**Problem**: Users got "You already have an active attempt" error when trying to access a test they had already started.

**Solution**:
- Modified `canUserStartTest` to return existing in-progress attempts instead of blocking
- Updated `startTestAttempt` to return existing attempts when available
- This allows users to resume their tests instead of being blocked

## Technical Changes

### Client-side (TestInterface.tsx):
```typescript
// State-based testId with fallbacks
const [testId, setTestId] = useState<string | undefined>(() => {
  return params.id || (() => {
    const path = window.location.pathname;
    const pathMatch = path.match(/\/test\/([^\/]+)/);
    return pathMatch ? pathMatch[1] : undefined;
  })();
});

// Update testId when params change
useEffect(() => {
  if (params.id && params.id !== testId) {
    setTestId(params.id);
  } else if (!params.id && !testId) {
    const path = window.location.pathname;
    const pathMatch = path.match(/\/test\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      setTestId(pathMatch[1]);
    }
  }
}, [params.id, location]);
```

### Server-side (testService.ts):
```typescript
// Return existing attempts instead of blocking
async canUserStartTest(testId: string, userId: string): Promise<{ 
  canStart: boolean; 
  reason?: string; 
  existingAttempt?: TestAttempt 
}> {
  // ... existing code ...
  if (attempt.status === 'in_progress') {
    // Return the existing attempt instead of blocking
    return { canStart: true, existingAttempt: attempt };
  }
  // ... rest of code ...
}

// Handle existing attempts in startTestAttempt
async startTestAttempt(testId: string, userId: string): Promise<TestAttempt> {
  const { canStart, existingAttempt } = await this.canUserStartTest(testId, userId);
  
  if (!canStart) {
    throw new Error('Cannot start test attempt');
  }

  // Return existing attempt if available
  if (existingAttempt) {
    return existingAttempt;
  }

  // Create new attempt only if none exists
  // ... create new attempt code ...
}
```

## Result
- ✅ TestInterface now properly extracts testId from URL
- ✅ Users can resume existing test attempts
- ✅ No more "active attempt" blocking errors
- ✅ Robust routing with multiple fallback methods
- ✅ Real-time test functionality preserved

The system now handles both routing edge cases and test attempt resumption properly!
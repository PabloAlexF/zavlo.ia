# Backend Error Fixes - March 12, 2026

## Issues Fixed

### 1. Price Alerts - Undefined Value Error ✅

**Error:**
```
Error: Value for argument "value" is not a valid query constraint. 
Cannot use "undefined" as a Firestore value.
```

**Root Cause:**
- `PriceAlertsController` was using `req.user.uid` to get the user ID
- JWT Strategy returns `req.user.userId`, not `req.user.uid`
- This caused `undefined` to be passed to Firestore queries

**Fix Applied:**
- Changed all occurrences of `req.user.uid` to `req.user.userId` in `price-alerts.controller.ts`
- Affected endpoints: POST /, GET /, GET /stats, DELETE /:id

**File Modified:**
- `src/modules/price-alerts/price-alerts.controller.ts`

---

### 2. Missing Firestore Composite Indexes ⚠️

**Errors:**
```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

**Missing Indexes:**
1. **search_logs** collection: `userId` (ASC) + `timestamp` (DESC)
2. **notifications** collection: `userId` (ASC) + `createdAt` (DESC)

**Fix Applied:**
- Created `firestore.indexes.json` with required composite indexes
- This file needs to be deployed to Firebase

**File Created:**
- `firestore.indexes.json`

**Deployment Required:**
To deploy the indexes to Firebase, run:
```bash
firebase deploy --only firestore:indexes
```

Or manually create the indexes by clicking the URLs in the error messages:
- Search Logs Index: https://console.firebase.google.com/v1/r/project/zavloia/firestore/indexes?create_composite=...
- Notifications Index: https://console.firebase.google.com/v1/r/project/zavloia/firestore/indexes?create_composite=...

---

## Testing

After deploying:
1. Test price alerts endpoints:
   - GET /api/v1/price-alerts (should return user's alerts)
   - GET /api/v1/price-alerts/stats (should return alert statistics)
   
2. Test analytics endpoints:
   - GET /api/v1/analytics/history?limit=10 (should return search history)
   
3. Test notifications endpoint:
   - GET /api/v1/notifications (should return user notifications)

---

## Build Status

✅ Backend rebuilt successfully with TypeScript compilation
✅ No compilation errors
✅ Ready for deployment

---

## Next Steps

1. Deploy the Firestore indexes using Firebase CLI or console
2. Restart the backend service to apply the controller fix
3. Monitor logs to confirm errors are resolved
4. Test all affected endpoints with authenticated user

---

## Notes

- The price alerts fix is immediate (already compiled)
- The Firestore indexes require manual deployment to Firebase
- Index creation can take a few minutes to complete
- Old queries will fail until indexes are built

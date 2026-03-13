# Zavlo IA - Fix Chat Crash + Limit Question Flow

## Steps
- [x] 1. Fix parseLimitInput in chatHelpers.ts (add 50/100 support)
- [x] 2. Robust loadChatHistory in page.tsx (prevent map crash)
- [x] 3. Fix category_question map crash (missing .map wrapper)
- [x] 4. Test: cd zavlo-ia && npm run dev
- [ ] 5. Test flow: category → location → sort → limit (10/20/50/100)
- [x] 6. Verify no crash after "No category questions"
- [x] 7. Fixed ReferenceError: i is not defined

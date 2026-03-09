# TODO - Sistema de Créditos

## Step 1: Create CreditUsedModal component
- [x] Create `frontend/components/modals/CreditUsedModal.tsx`
- [x] Modal shows credits spent after search
- [x] Shows remaining credits
- [x] Has close button

## Step 2: Modify Backend Search Service
- [x] Add `useCredit()` call in search.service.ts
- [x] Deduct 1 credit for text search
- [x] Deduct 2 credits for image search (1 identification + 1 search)

## Step 3: Modify Backend Search Controller
- [x] Return credit info in response (creditsUsed, remainingCredits)

## Step 4: Modify Frontend Search Page
- [x] Import CreditUsedModal
- [x] Add state for showing modal
- [x] Show modal after successful search
- [x] Update credits display

## Step 5: Test the implementation
- [ ] Test text search - modal should show 1 credit spent
- [ ] Test image search - modal should show 2 credits spent
- [ ] Verify credits are deducted in database


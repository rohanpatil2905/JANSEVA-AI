# JanSeva AI Citizen Frontend

## Work Progress

**Report date:** 2026-08-22
**Project:** `citizen-frontend`
**Technology:** React, Vite, React Router, Context API

## Completed Work

### Complaint sample data

File: `citizen-frontend/src/data/mockComplaints.js`

- Added six realistic sample citizen complaints.
- Added unique complaint IDs from `JS-001` through `JS-006`.
- Added all required fields:
  - `id`
  - `title`
  - `description`
  - `category`
  - `status`
  - `createdAt`
  - `location`
- Included the requested complaint categories:
  - Roads
  - Water Supply
  - Sanitation
  - Street Lights
  - Drainage
  - Public Safety
- Included realistic statuses:
  - Submitted
  - Under Review
  - Assigned
  - In Progress
  - Resolved
- Exported the array as the default export.

### Reusable complaint card

File: `citizen-frontend/src/components/ComplaintCard.jsx`

- Implemented a reusable `ComplaintCard` component.
- Receives a complaint object through the `complaint` prop.
- Displays the complaint ID, title, category, status, created date, and location.
- Uses semantic HTML elements including `article`, `header`, `dl`, `dt`, and `dd`.
- Uses React Router's `Link` component.
- Navigates to `/complaint/:id` using the complaint's actual ID.
- Clearly emphasizes the complaint status.
- Handles missing complaint values with fallback text.
- Handles a missing complaint ID by disabling the details action text.

### Routing and providers already present

File: `citizen-frontend/src/App.jsx`

- The route `/complaint/:id` is configured.
- Existing routes also cover home, login, registration, language selection, complaint submission, preview, user complaints, tracking, and not-found handling.

File: `citizen-frontend/src/main.jsx`

- The application is wrapped with:
  - `LanguageProvider`
  - `BrowserRouter`
  - `AuthProvider`
  - `ComplaintProvider`

### Language selection flow

Files:

- `citizen-frontend/src/context/LanguageContext.jsx`
- `citizen-frontend/src/components/LanguageSelector.jsx`
- `citizen-frontend/src/pages/Language.jsx`
- `citizen-frontend/src/index.css`

Current behavior:

- Supports English, Hindi, and Marathi.
- Persists the selected language in local storage.
- Provides a language selector component.
- Provides a dedicated language selection page with a continue action.
- Includes styling for the language selection UI.

## Validation Results

### Passed checks

- `npx eslint src/components/ComplaintCard.jsx`
  - Passed with no errors.
- JavaScript syntax validation for `mockComplaints.js`
  - Passed.
- Complaint fixture data validation
  - Six complaints found.
  - Complaint IDs are unique.
  - Required fields are present.
  - Categories and statuses are valid.
- `npm run build`
  - Passed successfully.
  - Vite transformed 39 modules.
  - Production files were generated in `dist/`.

### Outstanding validation issue

The full project lint command, `npm run lint`, reports four errors in existing context files:

- `citizen-frontend/src/context/AuthContext.jsx`
  - React Fast Refresh export warning treated as an error.
- `citizen-frontend/src/context/ComplaintContext.jsx`
  - React Fast Refresh export warning treated as an error.
- `citizen-frontend/src/context/LanguageContext.jsx`
  - Unused `React` import.
  - React Fast Refresh export warning treated as an error.

These errors are separate from `ComplaintCard.jsx`, which passes isolated linting.

## Current Architecture Notes

### Complaint state

File: `citizen-frontend/src/context/ComplaintContext.jsx`

- Complaints are currently loaded from local storage.
- If local storage is empty, the initial complaint list is empty.
- New complaints are added to state and persisted to local storage.
- User complaints are filtered by `userEmail`.

### Mock data integration status

- `mockComplaints.js` currently exists as fixture data.
- It is not yet imported into `ComplaintContext`.
- Therefore, the six sample complaints will not automatically appear in the application when local storage is empty.

### Complaint card integration status

- `ComplaintCard.jsx` is implemented and reusable.
- `MyComplaints.jsx` still contains its own inline complaint markup.
- The reusable card has not yet replaced that duplicated markup.

### API status

File: `citizen-frontend/src/services/api.js`

- Currently empty.
- The application does not yet have an API request layer.

## Recommended Roadmap

### Phase 1: Connect fixture data

1. Import `mockComplaints` into `ComplaintContext`.
2. Use it as the initial fallback when local storage has no complaints.
3. Add `userEmail` values if the sample complaints should belong to a test account.
4. Safely handle invalid JSON in local storage.

### Phase 2: Integrate the reusable card

1. Import `ComplaintCard` into `MyComplaints.jsx`.
2. Replace the repeated inline complaint markup with:

   ```jsx
   <ComplaintCard complaint={complaint} />
   ```

3. Verify that multiple complaints render correctly.
4. Verify that each View Details link opens the correct complaint.

### Phase 3: Verify complaint details and ownership

1. Confirm that the ID from the card matches `useParams()` in `ComplaintDetails.jsx`.
2. Confirm that the logged-in user's email matches the complaint's `userEmail`.
3. Add a clear not-found state for invalid IDs or unauthorized complaints.
4. Test direct navigation to `/complaint/JS-001`.

### Phase 4: Improve complaint persistence

1. Add stable complaint ID generation for newly submitted complaints.
2. Add update functionality for status changes.
3. Add loading and empty states.
4. Add error handling for local storage failures.
5. Decide whether local storage remains a prototype solution or is replaced by a backend.

### Phase 5: Implement the API layer

1. Define the API base URL and request helper in `services/api.js`.
2. Add complaint list, create, details, and status-update requests.
3. Add authentication handling for protected requests.
4. Add loading, success, and error states to the relevant pages.
5. Replace mock data incrementally after API responses are stable.

### Phase 6: Finish quality checks

1. Fix the four existing full-project ESLint errors.
2. Add component tests for `ComplaintCard`.
3. Add tests for complaint filtering and details lookup.
4. Test missing optional fields.
5. Test invalid complaint IDs.
6. Test language persistence after reload.
7. Start the development server and manually verify the primary user journey.

## Suggested Next Task

The highest-value next step is to connect `mockComplaints.js` to `ComplaintContext` and then use `ComplaintCard` inside `MyComplaints.jsx`. This will make the sample data visible and exercise the reusable component and details route together.

## Working Tree Note

At the time of this report, the working tree contains changes in these frontend files:

- `src/components/ComplaintCard.jsx`
- `src/components/LanguageSelector.jsx`
- `src/context/LanguageContext.jsx`
- `src/data/mockComplaints.js`
- `src/index.css`
- `src/main.jsx`
- `src/pages/Language.jsx`

The progress report itself is stored separately as `WORK_PROGRESS.md`.

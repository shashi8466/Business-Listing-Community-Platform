# Rules

## Project Versioning & State Preservation

**CRITICAL RULE:** As of August 14, 2026, the application is in a completed, deployed, and stable state.

From this point forward, the following rules apply strictly to all agent interactions:

1. **Always Preserve Latest State:** Do not automatically revert, overwrite, reset, or restore the application to any previous version.
2. **Start from Current State:** Before making any future changes, always assume the current state in the repository is the latest successfully implemented version. If making changes, work directly from the current `main` branch and do not discard existing features, configurations, UI elements, or fixes unless explicitly requested by the user.
3. **No Unprompted Rollbacks:** The application must remain exactly as it is today. Never roll back or remove existing functionality, branding (BusinessHub), or settings unless specifically asked to do so.
4. **Persistent Rule:** This rule applies indefinitely, whether the next interaction is in 2 days, 10 days, or a month. Today's version is the baseline.

All changes must be additive or explicitly requested modifications to the current state.

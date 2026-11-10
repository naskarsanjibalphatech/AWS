Gate SCADA - Readability and Gate Names Update

Source: your previous working Gate_SCADA_Overview_All_Roles.zip.

Changes:
- Operator and Remote Monitor pages: larger movement/status/position/flag labels and SVG animation labels.
- Group labels: Spillway Gates (1-4), Outlet Gates (5-6).
- Overview: only group names changed. Card sizes, fonts, layout remain as before.
- Admin: gate cards identify Spillway vs Outlet; user management unchanged.
- gateConnectivity.js: unchanged, including 30-second timeout.
- No AWS endpoints, PLC commands, animation geometry or permissions changed.

Installation:
1. Back up AWS/src/pages/home/.
2. Extract the ZIP and copy all .jsx and .js files to AWS/src/pages/home/.
3. In VS Code run npm.cmd run dev.
4. Verify all roles, labels, gate movement, offline status and controls before operational use.

Note: The package is built from the previously supplied Overview ZIP, not from any later local edits you may have made. If you have made additional changes since then, compare/merge instead of overwriting.

FIX 2026-11-10: Corrected misplaced CSS style-template closing in OperatorDashboard.jsx and RemoteUserDashboard.jsx (Vite SWC syntax error near Readability improvements).

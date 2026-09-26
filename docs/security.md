# CareerMatch AI — Security & Privacy Architecture

## 1. Authentication & Session Management

- **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` with 12 computational rounds.
- **JWT Access & Refresh Tokens**:
  - `access_token`: Short-lived (HS256) containing `sub` (User ID), `exp`, and `type: "access"`.
  - `refresh_token`: Long-lived (7 days) signed with an independent `REFRESH_SECRET_KEY`.
  - The client API interceptor automatically intercepts 401 Unauthorized responses to issue refresh requests transparently without logging out active users.

## 2. Authorization & RBAC

- Roles: `candidate`, `admin`, `recruiter`.
- Role-based dependencies enforce strict privileges:
  - `get_current_user`: Validates active candidate token.
  - `get_current_admin`: Asserts `user.role == 'admin'`, rejecting unauthorized attempts with `403 Forbidden`.

## 3. Defense Against Injection & Web Attacks

- **SQL Injection**: Prevented via SQLAlchemy ORM parameterized queries.
- **XSS & Content Sniffing**: `SecurityHeadersMiddleware` injects:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **CORS**: Restricted whitelist configured via `BACKEND_CORS_ORIGINS`.

## 4. File Upload Security

Uploaded resume documents represent a common attack vector. Security controls include:
1. **Extension Whitelisting**: Restricted to `.pdf` and `.docx`.
2. **MIME Verification**: Content-Type validation.
3. **File Size Capping**: Hard limit of 10MB per file.
4. **UUID Randomization**: Files are saved with cryptographically random UUID prefixes (`uuid4_filename`) to prevent path traversal and file overwriting.

## 5. Audit Logging

Sensitive actions are automatically logged in `audit_logs`:
- `REGISTER`
- `LOGIN` & `FAILED_LOGIN`
- `UPDATE_PROFILE`
- `UPLOAD_RESUME` & `DELETE_RESUME`
- `DELETE_ACCOUNT`

Audit logs store IP address, user-agent, entity identifiers, and action timestamps without recording passwords or secrets.

## 6. Privacy & Data Deletion Rights

Users have full ownership of their data:
- **Data Export**: `GET /api/profile/export-data` compiles a complete JSON archive of all candidate records.
- **Account Deletion**: `DELETE /api/profile/account` cascades and removes all personal records, parsed text, resumes, and matches.

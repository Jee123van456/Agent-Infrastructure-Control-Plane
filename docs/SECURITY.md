# TYLERDECK SECURITY SPECIFICATION

## Security Principles
1. **Zero Secret Logging**: API keys, passwords, bearer tokens, credit cards, and SSNs are automatically redacted in the SDK before transmission.
2. **SHA-256 Key Storage**: API keys generated as `td_live_...` are stored as one-way SHA-256 hashes in the database.
3. **Strict Multi-Tenant Isolation**: Every SQL query is automatically scoped by `organization_id`.
4. **Tool Permission Policies**: Configurable runtime actions (ALLOW, REQUIRE APPROVAL, BLOCK) with risk level enforcement (LOW, MEDIUM, HIGH, CRITICAL).

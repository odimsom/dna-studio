# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in DNA Studio, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@dnastudio.dev** (or open a private security advisory on GitHub)

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: within 48 hours
- **Initial assessment**: within 1 week
- **Fix and disclosure**: coordinated with reporter

## Scope

The following are in scope:

- Authentication and session management
- API route authorization
- Data exposure (API keys, user data)
- Injection vulnerabilities (SQL, XSS, command injection)
- Docker configuration security

## Best Practices for Self-Hosting

- Always change `NEXTAUTH_SECRET` from the default value
- Never expose your PostgreSQL or Redis ports to the public internet
- Use a reverse proxy (nginx, Caddy) with HTTPS in production
- Store API keys as environment variables, never in code
- Keep Docker images updated

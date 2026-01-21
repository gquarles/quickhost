# Quick Host
A simple lightweight express.js fileserver.

## Setup
```
git clone https://github.com/gquarles/quickhost
cd quickhost
npm install
```

## Run (HTTP)
```
node server.js
# or
npm start
```

## Run (HTTPS / Let's Encrypt via Greenlock)
```
node server.js --https yourdomain.com

# Optional overrides
node server.js --https yourdomain.com --email you@domain.com --first First --last Last

# Restrict uploads to internal only
node server.js --internal-only
node server.js --https yourdomain.com --internal-only
```

Notes:
- Your domain must point to this server and ports 80/443 must be reachable.
- HTTPS mode auto-initializes Greenlock config and registers the domain.

## Configuration
- PORT (default 8080)
- EXTERNAL_UPLOADS (true/false, default true). Set to false to restrict uploads to internal only.

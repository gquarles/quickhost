'use strict';

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
let app;

const DEFAULT_EMAIL = "example@live.com";
const DEFAULT_FIRST = "firstname";
const DEFAULT_LAST = "lastname";

function printUsage() {
  console.log(`
Usage:
  node server.js
  node server.js [--internal-only]
  node server.js --https <domain> [--email <email>] [--first <first>] [--last <last>] [--internal-only]

Defaults:
  --email ${DEFAULT_EMAIL}
  --first ${DEFAULT_FIRST}
  --last ${DEFAULT_LAST}
  uploads: external allowed (set --internal-only or EXTERNAL_UPLOADS=false to restrict)
`);
}

function parseArgs(argv) {
  const opts = {
    https: null,
    email: DEFAULT_EMAIL,
    first: DEFAULT_FIRST,
    last: DEFAULT_LAST,
    help: false,
    internalOnly: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }

    if (arg === "--internal-only") {
      opts.internalOnly = true;
      continue;
    }

    if (arg === "--https") {
      const domain = argv[i + 1];
      if (!domain || domain.startsWith("-")) {
        throw new Error("Missing domain for --https");
      }
      opts.https = domain;
      i += 1;
      continue;
    }

    if (arg.startsWith("--https=")) {
      opts.https = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--email") {
      const email = argv[i + 1];
      if (email && !email.startsWith("-")) {
        opts.email = email;
        i += 1;
      }
      continue;
    }

    if (arg.startsWith("--email=")) {
      opts.email = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--first") {
      const first = argv[i + 1];
      if (first && !first.startsWith("-")) {
        opts.first = first;
        i += 1;
      }
      continue;
    }

    if (arg.startsWith("--first=")) {
      opts.first = arg.split("=").slice(1).join("=");
      continue;
    }

    if (arg === "--last") {
      const last = argv[i + 1];
      if (last && !last.startsWith("-")) {
        opts.last = last;
        i += 1;
      }
      continue;
    }

    if (arg.startsWith("--last=")) {
      opts.last = arg.split("=").slice(1).join("=");
      continue;
    }
  }

  return opts;
}

function runCommand(command) {
  execSync(command, { stdio: "inherit" });
}

function setupGreenlock(domain, email, first, last) {
  const configDir = path.join(__dirname, "greenlock.d");
  const maintainerName = `${first} ${last}`.trim();

  console.log(`Using maintainer: ${maintainerName} <${email}>`);

  try {
    if (!fs.existsSync(configDir)) {
      console.log("Initializing Greenlock configuration...");
      runCommand(
        `npx greenlock init --config-dir "${configDir}" --maintainer-email "${email}"`
      );
    } else {
      console.log(`Greenlock config found at ${configDir}`);
    }

    console.log(`Registering domain ${domain}...`);
    runCommand(`npx greenlock add --subject ${domain} --altnames ${domain}`);
  } catch (err) {
    console.error("Failed to initialize HTTPS with Greenlock.");
    console.error(err.message || err);
    process.exit(1);
  }

  return configDir;
}

function startHttp() {
  const port = process.env.PORT || 8080;
  const externalUploads =
    (process.env.EXTERNAL_UPLOADS || "true").toString().toLowerCase() !==
    "false";
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
    console.log(`External file uploads: ${externalUploads}`);
  });
}

function startHttps(domain, email, first, last) {
  const configDir = setupGreenlock(domain, email, first, last);

  require("greenlock-express")
    .init({
      packageRoot: __dirname,
      maintainerEmail: email,
      configDir: configDir,
      cluster: false,
    })
    .serve(app);

  console.log(`HTTPS enabled for ${domain}`);
}

let options;
try {
  options = parseArgs(process.argv.slice(2));
} catch (err) {
  console.error(err.message || err);
  printUsage();
  process.exit(1);
}

if (options.help) {
  printUsage();
  process.exit(0);
}

if (options.internalOnly) {
  process.env.EXTERNAL_UPLOADS = "false";
}

app = require("./app");

if (options.https) {
  startHttps(options.https, options.email, options.first, options.last);
} else {
  startHttp();
}

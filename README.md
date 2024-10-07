# Solid(Start) Quickstart

Get up and running quickly with SolidStart.

## Setup overview

### Cloudflare

This project is meant to be deployed using Cloudflare. If you don't have an account, you can create one.
Connect your new project to your Cloudflare account using the following steps:

- "Workers & Pages"
- "Create"
- "Pages"
- "Connect to Git"

### Turso

This project uses Turso as a lightweight database. To get started, you'll need to create an account and a database.
Once you've done that, you can connect your project to Turso using the following steps:

- In Cloudflare, navigate to your new project.
- "Integrations"
- "Turso" -> "Add integration"

## Creating a project

```bash
# Create a new project using this template.
pnpm create solid@latest <APP_NAME> --template timredd/solid-quickstart
```

## Reference

```bash
# Install dependencies:
pnpm install

# Run dev server:
pnpm run dev
```

## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## This project was created with the [Solid CLI](https://solid-cli.netlify.app)

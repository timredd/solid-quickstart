import { openAPISpecs } from "hono-openapi";
import { app } from "../router";

import { apiReference } from "@scalar/hono-api-reference";
import { description, license, name, version } from "package.json";

export const openApi = openAPISpecs(app, {
  documentation: {
    info: {
      title: name,
      description: description,
      version: version,
      license: {
        name: license,
        url: "https://unlicense.org",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
    ],
  },
});

export const scalar = apiReference({
  spec: {
    url: "/openapi",
  },
  theme: "saturn",
});

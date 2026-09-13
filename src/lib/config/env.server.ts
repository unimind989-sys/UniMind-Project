import "server-only";

import {
  createCachedEnvironmentReader,
  parseServerEnvironment,
  withCanonicalApplicationOrigin,
} from "./env.schema";

export const getServerEnvironment = createCachedEnvironmentReader(() =>
  parseServerEnvironment(withCanonicalApplicationOrigin(process.env)),
);

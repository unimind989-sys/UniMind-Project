import {
  parseDeploymentSmokeCommand,
  runDeploymentSmoke,
} from "./lib/deployment-smoke";

const command = parseDeploymentSmokeCommand(process.argv.slice(2));
const result = await runDeploymentSmoke(command);

console.log(
  `Deployment smoke passed for ${result.target}: ${String(result.checks.length)} checks.`,
);

import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "npm:@aws-sdk/client-route-53";
import { parseArgs } from "jsr:@std/cli/parse-args";
import packageInfo from "./deno.json" with { type: "json" };

let error: Error | null = null;
let region: string, key: string, secret: string, zone: string, name: string;

try {
  region = Deno.env.get("AWS_REGION") as string;
  if (!region) throw new Error("Please provide an AWS_REGION env variable");

  key = Deno.env.get("AWS_ACCESS_KEY_ID") as string;
  if (!key) throw new Error("Please provide an AWS_ACCESS_KEY_ID env variable");

  secret = Deno.env.get("AWS_SECRET_ACCESS_KEY") as string;
  if (!secret)
    throw new Error("Please provide an AWS_SECRET_ACCESS_KEY env variable");

  zone = Deno.env.get("AWS_HOSTED_ZONE_ID") as string;
  if (!zone)
    throw new Error("Please provide an AWS_HOSTED_ZONE_ID env variable");

  name = Deno.env.get("AWS_NAME") as string;
  if (!name) throw new Error("Please provide an AWS_NAME env variable");
} catch (e) {
  error = e as Error;
}

const fileCacheName = "ip";

function getCurrentDateTime() {
  const now = new Date();
  const format = (num: number) => String(num).padStart(2, "0");

  return (
    `${format(now.getMonth() + 1)}/${format(
      now.getDate()
    )}/${now.getFullYear()} ` +
    `${format(now.getHours())}:${format(now.getMinutes())}:${format(
      now.getSeconds()
    )}`
  );
}

function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

function log(...messages: any[]) {
  console.log(getCurrentDateTime() + " |", ...messages);
}

async function updateRecord(ip: string) {
  const client = new Route53Client({
    region: region,
    credentials: {
      accessKeyId: key,
      secretAccessKey: secret,
    },
  }); // Change the region as needed

  const command = new ChangeResourceRecordSetsCommand({
    HostedZoneId: zone,
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: name,
            Type: "A",
            TTL: 300,
            ResourceRecords: [
              {
                Value: ip,
              },
            ],
          },
        },
      ],
    },
  });
  await client.send(command);
}

async function getIpFromFile() {
  try {
    return await Deno.readTextFile(fileCacheName);
  } catch {
    return "";
  }
}

function writeIpToFile(ip: string) {
  Deno.writeTextFileSync(fileCacheName, ip);
}
async function updateIP() {
  const cachedIp = await getIpFromFile();

  const currentIp = await fetch("https://icanhazip.com").then((res) => {
    return res.text();
  });

  if (cachedIp !== currentIp) {
    log("New IP: " + currentIp);
    log("Updating Route 53");

    try {
      await updateRecord(currentIp);

      if (currentIp) writeIpToFile(currentIp);
      log("Update completed");
    } catch (e) {
      log("Error updating IP: ");
      log(e);
    }
  } else {
    log("Current IP Matches");
  }
}

function writeHelp() {
  console.log(`
-----------------------------
route53-update
bbunks
${packageInfo.version}
-----------------------------


REQUIRED ENV VARIABLES
-----------------------------
AWS_ACCESS_KEY_ID: IAM Credential Key
AWS_SECRET_ACCESS_KEY: IAM Credential Secret Key
AWS_REGION: Region of Route 53
AWS_HOSTED_ZONE_ID: ID of the zone
AWS_NAME: Name of the record you would like to update


Args
-----------------------------
-r  --repeat  | sets an interval to check every 5 minutes
-h  --help    | shows useful information to run
`);
}

const flags = parseArgs(Deno.args, {
  boolean: ["-r", "--repeat", "-h", "--help"],
});

if (flags["-h"] || flags["--help"] || flags["--help"]) {
  writeHelp();
} else {
  log("Starting")
  if (error) {
    log(error);
    writeHelp();
  } else {
    updateIP();

    if (flags["-r"] || flags["r"] || flags["--repeat"]) {
      while (true) {
        await sleep(300);
        updateIP();
      }
    }
  }
}

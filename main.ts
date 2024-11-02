import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "npm:@aws-sdk/client-route-53";

const region = Deno.env.get("AWS_REGION") as string;
if (!region) throw new Error("Please provide AWS_REGION env variable");

const key = Deno.env.get("AWS_ACCESS_KEY_ID") as string;
if (!region) throw new Error("Please provide AWS_ACCESS_KEY_ID env variable");

const secret = Deno.env.get("AWS_SECRET_ACCESS_KEY") as string;
if (!region)
  throw new Error("Please provide AWS_SECRET_ACCESS_KEY env variable");

const zone = Deno.env.get("AWS_HOSTED_ZONE_ID") as string;
if (!region) throw new Error("Please provide AWS_HOSTED_ZONE_ID env variable");

const name = Deno.env.get("AWS_NAME") as string;
if (!region) throw new Error("Please provide AWS_NAME env variable");

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
          Action: "UPSERT", // Use 'UPSERT' to create or update the record
          ResourceRecordSet: {
            Name: name, // Replace with the name of your domain
            Type: "A", // Record type
            TTL: 300, // Time to live
            ResourceRecords: [
              {
                Value: ip, // Replace with the new IP address or value
              },
            ],
          },
        },
      ],
    },
  });
  const response = await client.send(command);
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

const cachedIp = await getIpFromFile();

const currentIp = await fetch("https://icanhazip.com").then((res) => {
  return res.text();
});

if (cachedIp !== currentIp) {
  console.log("New IP: " + currentIp);
  console.log("Updating Route 53");

  try {
    await updateRecord(currentIp);

    if (currentIp) writeIpToFile(currentIp);
  } catch (e) {
    console.log("Error updating IP: ");
    console.log(e);
  }
} else {
  console.log(getCurrentDateTime() + " | Current IP Matches");
}

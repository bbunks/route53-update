import {
  Route53Client,
  ChangeResourceRecordSetsCommand,
} from "npm:@aws-sdk/client-route-53";

async function updateRecord(ip: string) {
  const client = new Route53Client({
    region: Deno.env.get("AWS_REGION"),
    credentials: {
      accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID"),
      secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY"),
    },
  }); // Change the region as needed

  const command = new ChangeResourceRecordSetsCommand({
    HostedZoneId: Deno.env.get("AWS_HOSTED_ZONE_ID"),
    ChangeBatch: {
      Changes: [
        {
          Action: "UPSERT", // Use 'UPSERT' to create or update the record
          ResourceRecordSet: {
            Name: "apt.bbunks.com", // Replace with the name of your domain
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

const cachedIp = localStorage.getItem("ip");

const currentIp = await fetch("https://icanhazip.com").then((res) => {
  return res.text();
});

if (cachedIp !== currentIp) {
  console.log("New IP: " + currentIp);
  console.log("Updating Route 53");

  try {
    await updateRecord(currentIp);

    if (currentIp) localStorage.setItem("ip", currentIp);
  } catch (e) {
    console.log("Error updating IP: ");
    console.log(e);
  }
}

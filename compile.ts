import { join } from "jsr:@std/path";

const binaryName = "route53_update";

const outputString = (platform: string) =>
  join(Deno.cwd(), "release", binaryName + "-" + platform);
const commandArgs = (platform: string) =>
  `compile --allow-sys --allow-read --allow-write --allow-env --allow-net --output ${outputString(
    platform
  )} main.ts`.split(" ");

const platforms = [
  "x86_64-pc-windows-msvc",
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu",
];

platforms.forEach((platform) => {
  const output = new Deno.Command(Deno.execPath(), {
    args: commandArgs(platform),
  });
  console.log(commandArgs(platform));
  output.spawn();
});

export function getCurrentDateTime() {
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

export function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function log(...messages: any[]) {
  console.log(getCurrentDateTime() + " |", ...messages);
}

export async function getIpFromFile(fileCacheName: string) {
  try {
    return await Deno.readTextFile(fileCacheName);
  } catch {
    return "";
  }
}

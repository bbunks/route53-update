FROM denoland/deno:2.0.4

WORKDIR /app

# Prefer not to run as root.
USER deno

# These steps will be re-run upon each file change in your working directory:
COPY . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "main.ts", "-r"]
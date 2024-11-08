# Route53 Updater

A simple DDNS to update route53 name with the current public IP of a device.

Written with Deno

## How it works

The app has a file named `ip` stored in the directory it is ran from. This is used to store  the current ip. When the program runs, it will fetch the public URL from a public ip checker, then compare that against what is cached locally. If they ip is different, it will push an update to route53.

## Enviroment Variables

All enviroment variables are required. Currently there are no other options for passing data as this was designed to run in a docker instance.

| Variable name         | Description                            |
| --------------------- | -------------------------------------- |
| AWS_ACCESS_KEY_ID     | AWS IAM credential Key                 |
| AWS_SECRET_ACCESS_KEY | IAM Credential Secret Key              |
| AWS_REGION            | Region of the Route 53 zone            |
| AWS_HOSTED_ZONE_ID    | ID of the zone                         |
| AWS_NAME              | Name of the rocrd you would like to update   |

## Running the program

1. Download the executable release
2. Set your Enviroment Variables
2. Run the bianary

### Reoccuring Mode

Add `-r` when running and the app will become a long running task that will check eveevry 5 minutes


## Running the program for dev

This program runs on on deno
1. Install Deno
2. Install deps with `deno install`
3. Create a `.env` file with all variables above
4. Run `deno run app`

## Building the Binary

1. Ensure Deps are up to date
2. Run `deno run build`

This will produce a file named `route53-update`. You can run this directly on your system

## Building the Docker Container

1. Run `deno run docker`

All done.
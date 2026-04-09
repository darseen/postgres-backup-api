<div align="center">

# Postgres Backup API

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/postgres-backup-api?referralCode=InkF11&utm_medium=integration&utm_source=template&utm_campaign=generic)

The Postgres Backup API is a lightweight Node.js service that allows you to securely download highly-compressed PostgreSQL database backups via a single HTTP endpoint. It streams the native `pg_dump` output directly to your browser or terminal without consuming any local disk space, ensuring fast, out-of-memory-safe database exports.

</div>

## Features

- **Zero Disk Usage:** Streams the backup directly to the client via HTTP.
- **Highly Compressed:** Uses Postgres's custom format (`-Fc`) for minimal bandwidth.
- **Token Security:** Enforces optional API key authentication to keep your data safe.
- **Dynamic Postgres Versions:** Set the exact `PG_VERSION` to match your database.

## About Hosting Postgres Backup API

Hosting this backup service involves deploying a lightweight container capable of running both Node.js and the native PostgreSQL client tools.

When deployed, the Express server listens for HTTP GET requests on the `/` route. Instead of saving large backup files to ephemeral storage, it directly pipes the data stream to the client. To ensure safety in a public cloud environment, the deployment relies on environment variables to establish the database connection and enforce token-based authentication for all backup requests.

## Common Use Cases

- Automated off-site backups triggered by scheduled cron jobs (e.g., using `curl` or `wget`).
- Secure, one-click manual database snapshots for your team without distributing raw database credentials.
- Quickly pulling copies of production data down to your local machine for staging and development.

## Environment Variables

To deploy this service successfully, you must configure the following environment variables:

| Variable       | Description                                                                                                                            | Required | Default |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :------: | :------ |
| `DATABASE_URL` | The full connection string of the PostgreSQL database you want to back up.                                                             | **Yes**  | -       |
| `SECRET_TOKEN` | A secure passphrase used to authenticate requests. If set, backups can only be downloaded by appending `?token=YOUR_TOKEN` to the URL. |    No    | -       |
| `PG_VERSION`   | Adjust this if you need a specific major version of the Postgres client tools to match your database.                                  |    No    | `18`    |

## How to Download a Backup

Once deployed, you can trigger a backup from your browser or terminal by sending a GET request to the `/` endpoint:

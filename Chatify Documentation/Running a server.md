You can run your own Chatify server, but it requires some setup.

## Requirements

* A [Supabase](https://supabase.com/dashboard) account
* Somewhere to host your server
* [Deno](https://deno.com/manual@v1.11.0/getting_started/installation) installed
* Patience

## Supabase Project Setup

If you've already setup a project's database, continue to the next step.

Currently, this is not automated, so you'll need to set everything up by hand.

#### Buckets

Okay: let's start with the easy one. Chatify only uses one storage bucket:

* Named `user_data`
* Public

Below are recommendations, but you can really do anything:

* Max upload size: `3MB`
* Allowed MIME types: `image/jpg, image/png`

Note that some clients may force these restrictions.

#### Database Tables

todo

## Server Setup

Now, let's prepare the actual server. Do all of this on the server itself. If you're updating/reinstalling, delete the Chatify folder that you cloned and redo these instructions.

#### Clone Repository

First of all, using your preferred method, clone the GitHub repository into a folder and go into that folder.

Example: `git clone https://github.com/BedCrabDev/Chatify.git && cd Chatify`

#### `.env` file

From your Supabase project, go to `Project Settings`, then `API`. Then, make a `.env` file inside of your folder.

Here are the .env values needed:
```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE=...
```

Here's how to do it in bash:
```bash
touch .env
echo "SUPABASE_URL=..." >> .env
echo "SUPABASE_SERVICE_ROLE=..." >> .env
```

Set both values to the values you find on the Supabase dashboard.

#### Startup Command

There are two different startup commands. Run these in the root folder.

```bash
# For Production
deno run --allow-read --allow-env --allow-net src/main.ts

# For Development
deno run --watch --allow-all src/main.ts
```


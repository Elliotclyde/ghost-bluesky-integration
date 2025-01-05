# Ghost CMS Bluesky integrations

## What is this?  

This provides a way to automatically post to [bluesky](https://bsky.app/) when you publish a new post on your self-hosted [Ghost CMS](https://ghost.org/) instance. 

It is a lil tiny express app that will listen on a `/post-published` endpoint which you can hit with the post published Ghost webhook. 

If you're self-hosting a ghost app, you should be able to start this app on the same server then use a ghost webhook to hit it. 

## Usage 

First you'll need your bluesky handle and an app password. The integration will work with your regular password but you should instead create an app password so you're not slinging around your actual password. You can find instructions on how to create an app password here: 

https://lifehacker.com/tech/why-you-should-be-using-bluesky-app-passwords

Then you can start the integration listening with:

`node .\index.js --blueskyidentifier 'dril.bsky.social'  --blueskypass 'myAppPass'`

You can configure the port: 

`node .\index.js --blueskyidentifier 'dril.bsky.social'  --blueskypass 'myAppPass' --port 4200`

Otherwise it will default to port 7969.

By default it will use the Ghost post excerpt as the text of the bluesky post, then a link to the post. You can replace the excerpt with the title instead by adding this flag:

`node .\index.js --blueskyidentifier 'dril.bsky.social'  --blueskypass 'myAppPass' --usetitle`

Then add a custom integration and add the url `http://127.0.0.1:7969/post-published` to the ghost "post published" webhook.

### Docker

The Dockerfile takes your identifier and app password as environment variables:

```bash
docker run --name ghost-bluesky-integration \
-e IDENTIFIER=<your Bluesky identifier> \
-e PASS=<your App Password> \
-e USETITLE=<TRUE|FALSE> \
-p 7969:7969 \
--restart=unless-stopped \
ghcr.io/elliotclyde/ghost-bluesky-integration:latest
```

Alternatively as a `docker-compose` file:

```yaml
version: "3.3"
services:
  ghost-bluesky-integration:
    container_name: ghost-bluesky-integration
    environment:
      - IDENTIFIER=<your Bluesky identifier>
      - PASS=<your App Password>
      - USETITLE=<TRUE|FALSE>
    ports:
      - 7969:7969
    restart: unless-stopped
    image: ghcr.io/elliotclyde/ghost-bluesky-integration:latest
```

## Tests

If you're contributing, you can run tests with node's built-in test runner by running the following command from the root of the project:

```
node --test
```
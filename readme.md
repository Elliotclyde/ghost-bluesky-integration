# Ghost CMS Bluesky integrations

## What is this?  

This provides a way to automatically post to [bluesky](https://bsky.app/) when you publish a new post on your self-hosted [Ghost CMS](https://ghost.org/) instance. 

It is a lil tiny express app that will listen on a `/post-published` endpoint which you can hit with the post published Ghost webhook. 

If you're self-hosting a ghost app, you should be able to start this app on the same server then use a ghost webhook to hit it. 

## Usage 

First you'll need your blueky handle and an app password. The integration will work with your regular password but you should instead create an app password so you're not slinging around your actual password. You can find instructions on how to create an app password here: 

https://lifehacker.com/tech/why-you-should-be-using-bluesky-app-passwords

Then you can start the integration listening with:

`node .\index.js --blueskyidentifier 'dril.bsky.social'  --blueskypass 'myAppPass'`

You can configure the port: 

`node .\index.js --blueskyidentifier 'dril.bsky.social'  --blueskypass 'myAppPass' --port 4200`

Otherwise it will default to port 7969.

Then add a custom integration and add the url `http://127.0.0.1:7969/post-published` to the ghost "post published" webhook.

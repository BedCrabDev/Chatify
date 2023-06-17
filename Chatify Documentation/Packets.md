Before reading about packets, you should see [[Handshake]] for information about authentication, [[Concepts]] to learn how the app works, and add all the [[Types]] into your app.

#### `hello`
A hello packet is sent by the server when the socket starts. The object is a [[Types#SelfUser]].

# Guilds & Channels

#### `listguilds`
When sent to the server, the server returns a list of guilds (`Guild[]`) in a packet with the same name (`listguilds`).

#### `guild`
When sent to the server with a server id (`number`), sends a `guild` packet of the following schema:

```json
{
	guild: Guild,
	channels: Channel[]
}
```

(or nothing is sent back if the guild doesn't exist or membership is missing)

#### `channel`
When sent to the server with a channel id (`number`), sends a `channel` packet containing all of the messages and users in the channel.

```json
{
	messages: Message[],
	users: User[]
}
```

# Active Channels & Messages

#### `setactivechannel`
When sent to the server, sets the active channel. The client must send the following schema:

```json
{
	guild: number,
	channel: number
}
```

#### `unsetactivechannel`
When sent to the server, unsets the active channel. No arguments.

#### `post`
When sent to the server, sends a message in the active channel.

```json
{
	content: string,
	// all properties below are optional
	attachments: File[]
}
```

#### `typing`
When sent to the client, indicates that a user has started typing. Has an argument of the `User` that started typing.

#### `message`
When sent to the client, indicates that a user posted a message. Has an argument of the `Message` that was posted.

# Files

#### `upload` (serverbound)
Sent by the client to request uploading a file. The only arguments is the file.

#### `uploadstatus` (clientbound)
Sent by the server to indicate weather a file upload succeed or failed.

```json
{
	result: "success" | "failure",
	// properties below are all optional
	// they only show if "result" is "success"
	uploadedAs: string
}
```

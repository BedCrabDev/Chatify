Note that these types can be copy-pasted into typescript types.

#### Authentication
Contains the info needed to sign in. See [[Handshake]].

```json
// The actual Authentication object is not JSON, but a string of base64'd json that follows the schema:
{
	"id": number,
	"pass": string
}
```

#### User
A [[#User]] object contains a user's public profile.

```json
{
	id: string,
	created: Date,
	handle: string,
	displayName: string
}
``` 

#### SelfUser
A [[#SelfUser]] object is a [[#User]], but also contains some private information. It is an extension of a user, meaning all [[#User]] properties exist on here.

```json
{
	handleLastUpdated: Date,
	email: string
}
```

#### File
A [[#File]] object contains a link to a image. See the `upload` packet for more information about files.

```json
{
	userId: number,
	fileName: string,
	width: number,  // optional
	height: number  // optional
}
```

#### Guild
A [[#Guild]] has a bunch of channels and members (see [[#Membership]]). There is also one special guild with the id `-1` that all the channels are DMs (see [[Concepts#Direct Messages]]).

```json
{
	id: number,
	name: string,
	icon: File // optional
}
```

#### Membership
A [[#Membership]] represents a [[#User]] being in a [[#Guild]]. Basically, if there is a [[#Membership]] with a [[#User]]'s id and a [[#Guild]]'s id, that means the user is part of the guild.

```json
{
	guild: number,
	user: number
}
```

#### Channel
A [[#Channel]] is where users talk. Each guild has a list of channels that users can talk in. Channel names can include any character. There's also an emoji icon with a color, and a description for users to understand what the channel is for.

```json
{
	id: number,
	guild: number,
	name: string,
	description: string
}
```

#### Message
A [[#Message]] is sent by a [[#User]] inside of a [[#Channel]]. A message contains text, and maybe some attachments (see [[Concepts#Images]]).

```json
{
	id: number,
	channel: number,
	guild: number,
	content: string,
	author: User,
	attachments: File[]
}
```
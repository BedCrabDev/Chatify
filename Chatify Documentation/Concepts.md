#### Images
Images can be uploaded to your personal folder by sending an `upload` packet. The upload limit is 3MB. Only `.png`, `.jpg`, and `.gif` files can be uploaded. After this, your client will receive a `uploadstatus` packet.

#### Active Channel
After sending a `setactivechannel` packet, you switch your client's active channel. When a channel is active, you'll receive `typing` and `message` packets for that channel. When there is no active channel, like when you call `unsetactivechannel`, these packets will never be sent to the client.

#### Direct Messages
Direct Messages, aka DMs, is a guild with the id `-1` . All channels are messages with other users.
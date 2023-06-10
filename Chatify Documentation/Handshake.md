When connecting, you must send an [[Types#Authentication]] object:

```json
{
	"token": Authenthication
}
```

Note: Some `socket.io` clients ask for a Bearer token instead. Send your [[Types#Authentication]] object as the token.

Preferably, your client should ask for the password on a new session.

Once you've connected, you'll get a [[Packets#hello]] packet containing your [[Types#SelfUser]]. 

Error messages should end with `: see spec for info` if your code is broken or just `Invalid credentials` if the user typed the wrong ID/Password.
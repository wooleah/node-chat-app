# Chat app
> Made with Node.js + Socket.io
## Features
- People can look at open rooms and join them.
- People can talk to each other.
- It will show 'User is typing...' message when someone is typing.
- People can see who is in the same chatroom with them.
- People can check who they are (Icon is shown next to their name indicating current user).
## Used Library
> For server
- node.js / npm (v8.2.1)
- socket.io (v2.0.3)
- express (v4.15.4)
- moment (v2.18.1)
- linkifyjs (v2.1.4)
> For client
- jQuery (v3.2.1)
- mustache
- deparam
- moment
> For testing
- expect (v1.20.2)
- mocha (v3.5.0)
- nodemon (v1.11.0)
## Setup and configuration
To install <pre><code>npm install</pre></code>
To run <pre><code>npm start</pre></code> or <pre><code>node server/server.js</pre></code>
Port is defined in **server.js**.
<pre><code>const port = process.env.PORT || 3000;</code></pre>
If you want to use your own IP address/hostname, then you can configure
<pre><code>server.listen(port, () => {
  console.log(`server is listening to port ${port}`);
});</code></pre>
to 
<pre><code>server.listen(port, '127.0.0.1(your IP)', () => {
  console.log(`server is listening to port ${port}`);
});</code></pre>
Once you've finished, you need to change **public/js/chat.js** and **public/js/index.js**
<pre><code>var socket = io();</code></pre>
to
<pre><code>var socket = io.connect('127.0.0.1(your IP):3000');</code></pre>
## Try it out
- <https://boiling-plateau-30042.herokuapp.com/>
## What can be added to this app?
- image uploading (extra: drag & drop)
- voice recording
- private message
- clickable room and user (to join, whisper, etc..)
- improvement in UI/UX

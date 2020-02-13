const Bundler = require("parcel-bundler");
const express = require("express");
const bundler = new Bundler(["index.html", "admin/index.html"]);
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const password =
	"625F7FDB99DE7DE358AB119EAD94C29B436764E1BFFB3AF4F1CA715B692CF155E62007572CE4101FEF09A98130369DE7A06CCD57903B4C5A9104D1444A02F4A2";
app.get("/", (req, res) => res.redirect("/index.html"));

app.get("/admin", (req, res) => res.redirect("/admin/index.html"));
let enabled = true;
app.use(bundler.middleware());
app.use(express.json());
io.on("connection", socket => {
	const boomerang = tt => 
	socket.on(tt, t => {
		io.emit(tt, t);
	});
	const allBoom = t => t.map(boomerang)
	socket.on("turn", tff => {
		const tf = JSON.parse(tff);
		if (typeof tf !== "boolean") return;
		enabled = tf;
	});
	allBoom(["evaluate", "evaled"]);
});

app.get("/enabled", (req, res) => res.send(enabled));
app.post("/password", (req, res) => {
	res.send(
		typeof req.body.data === "string" &&
			req.body.data.toUpperCase() === password.toUpperCase()
	);
});
setInterval(() => {
	const n = io.sockets;
	if (n.length !== last.length) io.emit("changed", Object.keys(n.connected))
}, 5000)
let last = [];
http.listen(1234, () => {
	console.log("listening on *:1234");
});

//import Bundler from "parcel-bundler";
import express from "express";
const { PORT = 1234 } = process.env;
// const bundler = new Bundler(["index.html", "admin/index.html"]);
const app = express();
import db from "quick.db";
import { createServer } from "http";
const http = createServer(app);
import socketIo from "socket.io";
const io = socketIo(http);
const password =
	"625F7FDB99DE7DE358AB119EAD94C29B436764E1BFFB3AF4F1CA715B692CF155E62007572CE4101FEF09A98130369DE7A06CCD57903B4C5A9104D1444A02F4A2";
// app.get("/", (req, res) => res.redirect("/index.html"));
// app.get("/admin", (req, res) => res.redirect("/admin/index.html"));
let enabled = true;
// app.use(bundler.middleware());
if (!db.get("names")) db.set("names", {})
app.use(express.json());
io.on("connection", socket => {
	const boomerang = (tt: string) =>
		socket.on(tt, t => {
			io.emit(tt, t);
		});
	const allBoom = (t: string[]) => t.map(boomerang);
	socket.on("turn", tff => {
		const tf = JSON.parse(tff);
		if (typeof tf !== "boolean") return;
		enabled = tf;
	});
	allBoom(["evaluate", "evaled"]);
});
app.get("/enabled", (req, res) => res.send(enabled));
app.get("/name", (req, res) => typeof req.query.id === "string" ? res.send(db.get(`names.${req.query.id}`)) : res.sendStatus(400))
app.post("/name", (req, res) => typeof req.body.id === "string" && typeof req.body.name === "string" ? res.send(db.set(`names.${req.body.id}`, req.body.name)) : res.sendStatus(400))
app.post("/password", (req, res) => {
	res.send(
		typeof req.body.data === "string" &&
			req.body.data.toUpperCase() === password.toUpperCase()
	);
});
let last: string[] = [];
app.get("/socks", (req, res) => res.send(last));
app.post("/account", (req, res) =>
	typeof req.body.id === "string" && typeof req.body.content === "object"
		? res.send(db.set(`accounts.${req.body.id}`, req.body.content))
		: res.sendStatus(400)
);

app.get("/admin", (req, res) => res.redirect("/src/admin"));
app.put("/account", (req, res) =>
	typeof req.body.id === "string" &&
	typeof req.body.key === "string" &&
	typeof req.body.value === "string"
		? res.send(
				db.set(
					`accounts.${req.body.id}.${req.body.key}`,
					req.body.value
				)
		  )
		: res.sendStatus(400)
);
app.get("/account", (req, res) =>
	typeof req.query.id === "string"
		? res.send(db.get(`accounts.${req.query.id}`))
		: res.sendStatus(400)
);
app.use(express.static("./build"));
app.use(express.static("./src"));
setInterval(() => {
	const keys = Object.keys(io.sockets.connected);
	if (keys.length !== last.length) io.emit("changed", keys);
	last = keys;
}, 5000);
http.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});

//import Bundler from "parcel-bundler";
import { BetterQuickDB } from "./db";
const bdb = new BetterQuickDB();
import express from "express";
const { PORT = 1234 } = process.env;
// const bundler = new Bundler(["index.html", "admin/index.html"]);
const app = express();
import crypto from "crypto";
import db from "quick.db";
import { createServer } from "http";
import { join } from "path";
const http = createServer(app);
import socketIo from "socket.io";
const io = socketIo(http);

const hash = crypto.createHash("sha512");
hash.setEncoding("hex");
const password =
	"625F7FDB99DE7DE358AB119EAD94C29B436764E1BFFB3AF4F1CA715B692CF155E62007572CE4101FEF09A98130369DE7A06CCD57903B4C5A9104D1444A02F4A2";
const dbPassword =
	"3a2b29ce511137096b45b566b3c58eae6c45c14db20bb0e5d9b13d023d1f48a5ab67da451cbbb6ab5d6d004c129485fef43b54ed9c9e703034782aa40092d48a";
// app.get("/", (req, res) => res.redirect("/index.html"));
// app.get("/admin", (req, res) => res.redirect("/admin/index.html"));
let enabled = true;
let passworded = true;
// app.use(bundler.middleware());
const account = bdb.chain("accounts");
if (!db.get("names")) db.set("names", {});
app.use(express.json());
io.on("connection", socket => {
	const boomerang = (tt: string) =>
		socket.on(tt, t => {
			io.emit(tt, t);
		});
	const allBoom = (t: string[]) => t.map(boomerang);
	socket.on("turn", (tff: boolean) => {
		enabled = tff;
	});
	socket.on("passworded", (tff: boolean) => {
		passworded = tff;
	});
	allBoom(["evaluate", "evaled"]);
});
app.get("/db", (req, res) => res.redirect("/json.sqlite"))
app.get("/json.sqlite", (req, res) => {
	if (!req.query.pass) return res.sendStatus(400);
	const sha = crypto.createHash("sha512").update(req.query.pass);
	const result = sha.digest("hex");
	if (result.toUpperCase() === dbPassword.toUpperCase())
		return res.sendFile(join(__dirname, "./json.sqlite"));
	res.sendStatus(403);
});
app.get("/enabled", (req, res) => res.send(enabled));
app.get("/passworded", (req, res) => res.send(passworded));
app.get("/name", (req, res) =>
	typeof req.query.id === "string"
		? res.send(db.get(`names.${req.query.id}`))
		: res.sendStatus(400)
);
app.post("/name", (req, res) =>
	typeof req.body.id === "string" && typeof req.body.name === "string"
		? res.send(db.set(`names.${req.body.id}`, req.body.name))
		: res.sendStatus(400)
);
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
		? res.send(account.set(req.body.id, req.body.content))
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
		? res.send(account.get(req.query.id))
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

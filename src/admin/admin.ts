import Swal from "sweetalert2";
import io from "socket.io-client";
import { createHash } from "crypto";
let loaded = false;
window.onload = async () => {
	if (loaded) return;
	loaded = true;
	const responses = document.getElementById("responses");
	const adminnum = document.getElementById("adminnum");
	if (!(responses && adminnum)) return alert("e");
	const Toast = Swal.mixin({ toast: true, position: "bottom" });
	const Text = Swal.mixin({
		input: "text",
		inputValue: "",
		icon: "info",
		showCancelButton: true
	});
	const { value: pass } = await Text.fire({
		title: "Admin Password",
		input: "password"
	});
	const hashed = JSON.stringify({
		data: createHash("sha512")
			.update(pass)
			.digest("hex")
	});
	if (
		!JSON.parse(
			await (
				await fetch("/password", {
					method: "POST",
					body: hashed,
					headers: {
						"Content-Type": "application/json"
					}
				})
			).text()
		)
	)
		return (
			(document.body.style.display = "flex"),
			(document.body.innerHTML =
				"<h1 style='font-size:140px;margin-top:auto;margin-bottom:auto;margin-left:auto;margin-right:auto'>Nice try FBI</h1>"),
			await Toast.fire(
				"Permission Denied",
				"Incorrect password.",
				"error"
			)
		);
	const socket = io();
	socket.on("evaled", (e: any) => {
		const p = document.createElement("P");
		p.innerText = e
		responses.append(p)}
	);
	const updateCon = (n: string[]) => {
		while (adminnum.firstChild) adminnum.removeChild(adminnum.firstChild);
		for (const r of n) {
			const p = document.createElement("P");
			p.innerText = r;
			if (r === socket.id) p.classList.add("self");
			adminnum.append(p)
		}
	}
	socket.on("changed", updateCon)
	updateCon(await (await fetch("/socks")).json());
	const addTitle = (e: string, weight = "bolder") => {
		const ee = document.createElement("P");
		ee.innerText = e;
		ee.style.fontWeight = weight;
		document.body.append(ee);
	};
	const addButton = (
		e: string,
		onclick: (this: GlobalEventHandlers, ev: MouseEvent) => any
	) => {
		const ee = document.createElement("BUTTON");
		ee.innerText = e;
		ee.onclick = onclick;
		ee.classList.add("adminbutton");
		document.body.append(ee);
	};
	addTitle("AdminPanel");
	addButton("Enable", async () => {
		socket.emit("turn", true);
		await Toast.fire(
			"Turned On",
			"Electric Boi Clicker is now turned on.",
			"success"
		);
	});
	addButton("Disable", async () => {
		socket.emit("turn", false);
		await Toast.fire(
			"Turned Off",
			"Electric Boi Clicker is now turned off.",
			"success"
		);
	});
	addTitle("Other");
	addButton("Eval", async () => {
		const { value: text } = await Text.fire("Evaluate");
		socket.emit("evaluate", text);
	});
	await Toast.fire("Permission Granted", "Password was correct.", "success");
};
const f = setInterval(() => {
	document.body && (window.onload!({} as any), clearInterval(f));
});

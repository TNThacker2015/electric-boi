import { toWords } from "./words";
import Swal from "sweetalert2";
import env from "./env.json";
//// import io from "socket.io-client";
import { inspect } from "util";
import hrrs from "human-readable-random-string";
const q = BigInt;
const entries = Object.entries as <T>(
	o: T
) => [Extract<keyof T, string>, T[keyof T]][];
let addIntervals = true;
let last = Date.now();
const Toast = Swal.mixin({ toast: true, position: "bottom" });
localStorage.openpages = Date.now();
window.addEventListener(
	"storage",
	e => {
		if (e.key === "openpages") {
			localStorage.page_available = Date.now();
		}
		if (e.key === "page_available") {
			addIntervals = false;
		}
		if (e.key === "yeet") {
			last = Number(e.newValue) || Date.now();
		}
	},
	false
);
setInterval(() => (localStorage.yeet = Date.now()), 500);
let done = false;
let intervaled = false;
window.onload = async () => {
	try {
		if (done) return;
		done = true;
		let current: HTMLAudioElement | null = null;
		const playSound = async (s: string, v: number) => {
			if (current) current.pause();
			const e = document.getElementById(s) as HTMLAudioElement;
			if (!e) return false;
			current = new Audio(e.src);
			current.volume = v;
			current.loop = true;
			// await current.play();
			return true;
		};

		//// const enabled = JSON.parse(await (await fetch("/enabled")).text());
		//// const socket = io();
		const link = (document.querySelector("link[rel*='icon']") ||
			document.createElement("link")) as HTMLLinkElement;
		link.type = "image/x-icon";
		link.rel = "shortcut icon";
		link.href = (document.getElementById("ico") as HTMLLinkElement).href;
		document.head.append(link);

		let lastEval = 0;
		if (navigator.storage && navigator.storage.persist)
			await navigator.storage.persist();
		//// if (!enabled) return document.body.innerHTML = "<div style='text-align:center'><h1>Electric Boi Clicker is disabled.</h1><p>lol</p></div>"
		//#region DEBUG FUNCTIONS
		env.debug &&
			(() => {
				if (document.getElementById("debugbuttons")) return;
				const d = document.createElement("DIV");
				d.innerHTML = "<b>Debug Functions</b>: ";
				d.id = "debugbuttons";
				document.body.prepend(d);
				const createDebug = (
					name: string,
					func: (this: HTMLElement, ev: MouseEvent) => any
				) => {
					const e = document.createElement("BUTTON");
					e.addEventListener("click", func);
					e.innerText = name;
					d.append(e);
				};
				createDebug(
					"clear localstorage",
					() => (localStorage.clear(), location.reload())
				);
				createDebug(
					"reset costs",
					() => (
						localStorage.removeItem("applianceCosts"),
						location.reload()
					)
				);
				createDebug(
					"+1000000",
					() => (localStorage.electric = "1000000")
				);
			})();
		//#endregion
		await new Promise(res => setTimeout(res, 500));
		// if ()
		const defaults: Partial<Store> = {
			electric: q(0)
		};
		const store = new Proxy(Object.create(null) as Store, {
			get(t, k) {
				const val = localStorage[k as any];
				if (!val) return;
				if (typeof defaults[k as keyof Store] === "bigint")
					return q(val);
				try {
					return JSON.parse(val);
				} catch {
					return val;
				}
			},
			set(t, k, v) {
				try {
					localStorage[k as any] =
						typeof v === "string" ? v : JSON.stringify(v);
				} catch {
					localStorage[k as any] = v;
				}
				return true;
			}
		});
		const appliances = new Proxy(Object.create(null) as Appliances, {
			get(t, k) {
				return store.appliances[k as keyof Appliances] || 0;
			},
			set(t, k, v) {
				const app = store.appliances;
				app[k as keyof Appliances] = v;
				store.appliances = app;
				return true;
			}
		});
		const electricboi = document.getElementById("eleboi");
		const bois = document.getElementById("bois");
		const smallBois = document.getElementById("smallbois");
		const upgrades = document.getElementById("upgrades");
		const powerups = document.getElementById("powerups");
		const cps = document.getElementById("cps");
		const cpc = document.getElementById("cpc");
		const cps2 = document.getElementById("cps2");
		const crit = document.getElementById("crit");
		const boost = document.getElementById("boost");
		const windows = document.getElementById("window") as
			| undefined
			| HTMLAudioElement;
		const exclamation = document.getElementById("exclamation") as
			| undefined
			| HTMLAudioElement;
		const musicbar = document.getElementById("musicbar");
		const prebois = document.getElementById("prebois");
		if (
			!(
				electricboi &&
				bois &&
				smallBois &&
				upgrades &&
				powerups &&
				cps &&
				cpc &&
				cps2 &&
				crit &&
				windows &&
				exclamation &&
				prebois &&
				boost &&
				musicbar
			)
		)
			return (document.body.innerHTML = "err");
		type ApplianceCosts = {
			[e in keyof Partial<Appliances>]: bigint;
		};
		interface Store {
			electric: bigint;
			appliances: Partial<Appliances>;
			applianceCosts: ApplianceCosts;
			uuid: string;
			music: string;
			crit: number;
		}

		if (!store.appliances) store.appliances = {};
		if (!store.applianceCosts) store.applianceCosts = {};
		if (!store.electric) store.electric = q(0);
		if (!store.crit) store.crit = 10;
		if (!store.uuid)
			store.uuid = `${hrrs(5)}${Math.floor(Math.random() * 1000)
				.toString()
				.padStart(3, "0")}`;
		const applianceCosts = new Proxy(
			Object.create(null) as ApplianceCosts,
			{
				get(t, k) {
					const cost =
						store.applianceCosts[k as keyof ApplianceCosts];
					return cost && q(cost);
				},
				set(t, k, v) {
					const app = store.applianceCosts;
					(app[k as keyof ApplianceCosts] as any) = Number(v);
					store.applianceCosts = app;
					return true;
				}
			}
		);
		const getIncrease = () =>
			q(appliances.overclocking) + q(appliances.quantumprocessor * 5);
		(window as any).loadIntervals = () => {
			if (intervaled) return;
			addIntervals && (intervaled = true);
			addIntervals &&
				setInterval(() => {
					store.electric += getCPS();
				}, 1000);
		};
		(window as any).loadIntervals();
		setInterval(
			() =>
				last + 4000 < Date.now() &&
				((addIntervals = true), (window as any).loadIntervals())
		);
		setInterval(() => {
			const elecStr = store.electric.toString();
			bois.innerText = `Electric Bois: ${
				elecStr.length > 16
					? `${elecStr.slice(0, 16)}... (${elecStr.length - 16} more)`
					: elecStr
			}`;
			smallBois.innerText = toWords(store.electric);
		});
		const apps: {
			[e in keyof Partial<Appliances>]: {
				cost: bigint;
				elem: HTMLParagraphElement;
				countElem: HTMLParagraphElement;
				appElem: HTMLDivElement;
				buyElem: HTMLButtonElement;
			};
		} = {};
		const addInnerAppliance = (
			el: HTMLElement,
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) => {
			const app = document.createElement("div");
			app.classList.add("appliance");
			const r = document.createElement("p");
			r.classList.add("count");
			r.innerText = String(store.appliances[name]);
			app.append(r);
			const n = document.createElement("p");
			const f = document.createElement("div");
			f.classList.add("labels");
			app.append(f);
			n.classList.add("label");
			n.innerText = display;
			f.append(n);
			const e = document.createElement("p");
			e.classList.add("desc");
			e.innerText = desc;
			f.append(e);
			const c = document.createElement("p");
			c.classList.add("desc");
			c.classList.add("cost");
			c.innerText = String(baseCost);
			f.append(c);
			const buy = document.createElement("button");
			buy.classList.add("buy");
			buy.innerText = "BUY";
			buy.onclick = () => {
				// new Audio(windows.src).play();
				const obj = apps[name]!;
				onclick && onclick(obj);
				if (store.electric < obj.cost)
					return Swal.fire(
						"Not Enough Electric Bois",
						"You do not have enough electric bois to buy this.",
						"error"
					);
				else {
					appliances[name] += 1;
					store.electric -= obj.cost;
					obj.cost =
						typeof costMult === "bigint"
							? obj.cost * costMult
							: typeof costMult === "number"
							? q(Math.ceil(Number(obj.cost) * costMult))
							: q(costMult(obj.cost));
				}
			};
			app.append(buy);
			el.append(app);
			apps[name] = {
				get cost() {
					return (
						applianceCosts[name] ||
						(applianceCosts[name] = baseCost)
					);
				},
				set cost(cost) {
					applianceCosts[name] = cost;
				},
				elem: c,
				countElem: r,
				appElem: app,
				buyElem: buy
			};
		};
		const addAppliance = (
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) =>
			addInnerAppliance(
				upgrades,
				name,
				display,
				desc,
				baseCost,
				costMult,
				onclick
			);
		const addUpgrade = (
			name: keyof Appliances,
			display: string,
			desc: string,
			baseCost = q(10),
			costMult: number | bigint | ((arg: bigint) => number | bigint),
			onclick?: (e: typeof apps[keyof typeof apps]) => any
		) =>
			addInnerAppliance(
				powerups,
				name,
				display,
				desc,
				baseCost,
				costMult,
				onclick
			);

		const getCPS = () => {
			const e =
				q(appliances.computer) +
				q(appliances.supercomputer) * q(2) +
				q(appliances.graphics) * q(10) +
				q(appliances.cpu) * q(100) +
				q(appliances.ram) * q(500) +
				q(appliances.harddrive) * q(1000) +
				q(appliances.ssd) * q(100000) +
				q(appliances.swap) * q(1000000) +
				q(0);
			return e + (e / q(100)) * getIncrease();
		};
		type ApplianceNames = [
			"computer",
			"microchip",
			"supercomputer",
			"processor",
			"graphics",
			"cpu",
			"liquidcooling",
			"ram",
			"harddrive",
			"ssd",
			"motherboard",
			"sli",
			"swap",
			// upgrades
			"critical",
			"overclocking",
			"quantumprocessor"
		];
		type Appliances = {
			[index in ApplianceNames[number]]: number;
		};
		addAppliance("computer", "Computer", "+1 CPS", q(100), x => x + q(100));
		addAppliance("microchip", "Microchip", "+1 Per Click", q(150), 1.25);
		addAppliance(
			"supercomputer",
			"Supercomputer",
			"+2 CPS",
			q(250),
			x => x + q(200)
		);
		addAppliance("processor", "Processor", "+4 Per Click", q(1200), 1.25);
		addAppliance(
			"graphics",
			"Graphics Card",
			"+10 CPS",
			q(1000),
			x => x + q(550)
		);
		addAppliance("cpu", "CPU", "+100 CPS", q(20000), x => x + q(11550));
		addAppliance(
			"liquidcooling",
			"Liquid Cooling",
			"+15 Per Click",
			q(22000),
			1.1
		);
		addAppliance("ram", "RAM", "+500 CPS", q(90000), x => x + q(41550));
		addAppliance(
			"harddrive",
			"Hard Drive",
			"+1000 CPS",
			q(200000),
			x => x + q(81550)
		);
		addAppliance(
			"motherboard",
			"Motherboard",
			"+500 Per Click",
			q(1000000),
			x => x + q(400000)
		);
		addAppliance(
			"ssd",
			"SSD",
			"+100000 CPS",
			q(2000000),
			x => x + q(1281550)
		);
		addAppliance("sli", "SLI Bridge", "+10000 Per Click", q(35000000), 1.4);
		addAppliance("swap", "Swap Space", "+1000000 CPS", q(100_000_000), 1.4);
		// upgrades
		addUpgrade(
			"overclocking",
			"CPU Overclocking",
			"+1% Appliance Efficiency",
			q(1000),
			1.8
		);
		addUpgrade("critical", "USB Drive", "+1% Crit Chance", q(6000), 5);
		addUpgrade(
			"quantumprocessor",
			"Quantum Processor",
			"+5% Appliance Efficiency",
			q(1000000),
			11
		);
		setInterval(() => {
			for (const r of Object.values(apps))
				r!.elem.innerText = toWords(r!.cost);
			for (const [f, r] of Object.entries(apps))
				r!.countElem.innerText = String(
					appliances[f as keyof Appliances] || 0
				);
		});
		setTimeout(
			() =>
				store.electric ||
				Toast.fire(
					"Click!",
					"Click the electric boi gif to gain electric bois!",
					"info"
				),
			8000
		);
		const getClicks = () =>
			q(appliances.microchip) +
			q(appliances.processor) * q(4) +
			q(appliances.liquidcooling) * q(15) +
			q(appliances.motherboard) * q(500) +
			q(appliances.sli) * q(10000) +
			q(1);
		const getCritical = () => q(appliances.critical) + q(1);
		setInterval(() => {
			cps.innerText = toWords(getCPS());
			cpc.innerText = toWords(getClicks());
			crit.innerText = `${getCritical()}%`;
			crit.title = `There is a ${getCritical()}% chance that a manual click will be worth ${
				store.crit
			}x its normal amount!`;
			boost.innerText = `${getIncrease()}%`;
			boost.title = `All appliances produce ${getIncrease()}% more electric bois.`;
		});
		setInterval(() => {
			for (const [k, v] of Object.entries(apps)) {
				if (store.electric < v!.cost) {
					v!.appElem.style.backgroundColor = "#9338";
					v!.buyElem.style.backgroundImage =
						"linear-gradient(#c52, #831)";
					v!.buyElem.style.cursor = "not-allowed";
				} else {
					v!.appElem.style.backgroundColor = "#6f28";
					v!.buyElem.style.backgroundImage = "";
					v!.buyElem.style.cursor = "";
				}
			}
		});
		let t = 0;
		let lt = 0;
		const cpsTimeout = () =>
			setTimeout(() => {
				cps2.innerText = String(t - lt);
				lt = t;
				cpsTimeout();
			}, 1000);
		cpsTimeout();
		electricboi.addEventListener("click", () => {
			const ex = new Audio(exclamation.src);
			ex.volume = 0.1;
			// ex.play();
			t++;
			if (getCritical() > q(Math.floor(Math.random() * 100))) {
				store.electric += getClicks() * q(store.crit);
				electricboi.style.filter =
					"hue-rotate(150deg) saturate(5) brightness(6)";
				setTimeout(() => (electricboi.style.filter = ""), 500);
			} else {
				store.electric += getClicks();
			}
		});
		////socket.on("evaluate", async(e: string) => {
		////	socket.emit("evaled", `${store.uuid}: ${inspect(await eval(e))}`);
		////})
		// playSound(store.music || "rick", 0.7);
		for (const elem of ["EndlessRick", "SovietAnthem", "Silence"]) {
			const ne = document.createElement("BUTTON");
			ne.onclick = () => (
				(store.music = elem.toLowerCase()),
				playSound(elem.toLowerCase(), 0.5)
			);
			ne.innerText = elem;
			musicbar.append(ne);
		}
		const date = new Date();
		const h = 0; //date.getHours();
		const d = date.getDay();
		if (h >= 9 && h <= 15 && d >= 1 && d <= 5) {
			electricboi.style.visibility = "none";
			const { value: pass } = await Swal.fire({
				title: "Bypass Password",
				text:
					"Enter the password if you know it. If you don't, that means you aren't supposed to.",
				input: "password",
				allowOutsideClick: false,
				inputValue: "",
				icon: "info"
			});
			if (pass !== "get jamed")
				return await Swal.fire({
					title: "Access DENIED!",
					html:
						"Incorrect password.<br />Do your work now; stop playing games.",
					icon: "error",
					allowOutsideClick: false,
					showConfirmButton: false
				});
			else {
				await Swal.fire({
					toast: true,
					text: "Password was correct.",
					title: "Access Granted.",
					position: "bottom",
					icon: "success"
				});
				electricboi.style.visibility = "";
			}
		}
	} catch (err) {
		console.error(err);
	}
};
const f = setInterval(() => {
	document.body && (window.onload!({} as any), clearInterval(f));
});

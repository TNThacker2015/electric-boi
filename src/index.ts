import { toWords } from "./words";
import Swal from "sweetalert2";
import env from "./env.json";
const q = BigInt;
const entries = Object.entries as <T>(
	o: T
) => [Extract<keyof T, string>, T[keyof T]][];
let addIntervals = true;
let last = Date.now();
localStorage.openpages = Date.now();
throw "lol get yeeted"
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
setInterval(
	() =>
		last + 4000 < Date.now() &&
		((addIntervals = true), (window as any).loadIntervals())
);
let done = false;
let intervaled = false;
window.onload = async () => {
	//#region DEBUG FUNCTIONS
	env.debug && (() => {
		if (document.getElementById("debugbuttons")) return;
		const d = document.createElement("DIV");
		d.innerHTML = "<b>Debug Functions</b>: "
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
	})();
	//#endregion
	await new Promise(res => setTimeout(res, 500));
	// if ()
	if (done) return;
	done = true;
	const defaults: Partial<Store> = {
		electric: q(0)
	};
	const store = new Proxy(Object.create(null) as Store, {
		get(t, k) {
			const val = localStorage[k as any];
			if (!val) return;
			if (typeof defaults[k as keyof Store] === "bigint") return q(val);
			try {
				return JSON.parse(val);
			} catch {
				return val;
			}
		},
		set(t, k, v) {
			try {
				localStorage[k as any] = JSON.stringify(v);
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
	const cps = document.getElementById("cps");
	const cpc = document.getElementById("cpc");
	const cps2 = document.getElementById("cps2");
	if (!(electricboi && bois && smallBois && upgrades && cps && cpc && cps2))
		return (document.body.innerHTML = "err");
	type ApplianceCosts = {
		[e in keyof Partial<Appliances>]: bigint;
	};
	interface Store {
		electric: bigint;
		appliances: Partial<Appliances>;
		applianceCosts: ApplianceCosts;
	}

	interface Appliances {
		computer: number;
		microchip: number;
		supercomputer: number;
		processor: number;
		graphics: number;
		cpu: number;
	}
	if (!store.appliances) store.appliances = {};
	if (!store.applianceCosts) store.applianceCosts = {};
	if (!store.electric) store.electric = q(0);
	const applianceCosts = new Proxy(Object.create(null) as ApplianceCosts, {
		get(t, k) {
			const cost = store.applianceCosts[k as keyof ApplianceCosts];
			return cost && q(cost);
		},
		set(t, k, v) {
			const app = store.applianceCosts;
			(app[k as keyof ApplianceCosts] as any) = Number(v);
			store.applianceCosts = app;
			return true;
		}
	});
	for (const [k, v] of entries(defaults))
		v &&
			store[k as keyof Store] === undefined &&
			(store[k as keyof Store] = v as any);
	const getCPS = () =>
		q(appliances.supercomputer) * q(2) +
		q(appliances.graphics) * q(10) +
		 q(appliances.cpu) * q(100);
	(window as any).loadIntervals = () => {
		if (intervaled) return;
		addIntervals && (intervaled = true);
		addIntervals &&
			setInterval(() => {
				store.electric += q(appliances.computer);
			}, 2000);
		addIntervals &&
			setInterval(() => {
				store.electric += getCPS();
			}, 1000);
	};
	(window as any).loadIntervals();
	setInterval(() => {
		bois.innerText = `Electric Bois: ${
			store.electric < q(10000000000)
				? store.electric
				: `${store.electric /
						q(10) **
							q(
								store.electric.toString().length - 1
							)}e+${store.electric.toString().length - 1}`
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
	const addAppliance = (
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
		upgrades.append(app);
		apps[name] = {
			get cost() {
				return (
					applianceCosts[name] || (applianceCosts[name] = baseCost)
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
	addAppliance("computer", "Computer", "+0.5 CPS", q(100), x => x + q(100));
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
			Swal.fire(
				"Click!",
				"Click the electric boi gif to gain electric bois!",
				"info"
			),
		8000
	);
	const getClicks = () =>
		q(appliances.microchip) +
		q(appliances.processor) * q(4) +
		q(1);
	setInterval(() => {
		const re = appliances.computer / 2 + Number(getCPS());
		cps.innerText = re < 10000 ? String(re) : toWords(q(Math.round(re)));
		cpc.innerText = toWords(getClicks());
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
		t++;
		store.electric += getClicks();
	});
};
setTimeout(() => window.onload!({} as any), 1000);
const f = setInterval(() => {
	document.body && (window.onload!({} as any), clearInterval(f));
});

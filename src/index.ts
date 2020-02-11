import { toWords } from "./words";
import Swal from "sweetalert2";
const entries = Object.entries as <T>(
	o: T
) => [Extract<keyof T, string>, T[keyof T]][];
let done = false;
window.onload = async () => {
	if (done) return;
done = true;
const defaults: Partial<Store> = {
	electric: BigInt(0)
};
const store = new Proxy(Object.create(null) as Store, {
	get(t, k) {
		const val = localStorage[k as any];
		if (!val) return;
		if (typeof defaults[k as keyof Store] === "bigint")
			return BigInt(val);
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
console.log(appliances)
	const electricboi = document.getElementById("eleboi");
	const bois = document.getElementById("bois");
	const smallBois = document.getElementById("smallbois");
	const upgrades = document.getElementById("upgrades");
	const cps = document.getElementById("cps");
	const cpc = document.getElementById("cpc");
	if (!(electricboi && bois && smallBois && upgrades && cps && cpc))
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
	}
	if (!store.appliances) store.appliances = {};
	if (!store.applianceCosts) store.applianceCosts = {};
	if (!store.electric) store.electric = BigInt(0);
	const applianceCosts = new Proxy(Object.create(null) as ApplianceCosts, {
		get(t, k) {
			const cost = store.applianceCosts[k as keyof ApplianceCosts];
			return (cost) && BigInt(cost);
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
	setInterval(() => {
		bois.innerText = `Electric Bois: ${store.electric}`;
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
		baseCost = BigInt(10),
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
			if (store.electric < obj.cost) return Swal.fire("Not Enough Electric Bois", "You do not have enough electric bois to buy this.", "error");
			else {
				appliances[name] += 1;
				store.electric -= obj.cost;
				obj.cost =
					typeof costMult === "bigint"
						? obj.cost * costMult
						: typeof costMult === "number" ? BigInt(Math.ceil(Number(obj.cost) * costMult)): BigInt(costMult(obj.cost));
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
			buyElem: buy,
		};
	};
	addAppliance("computer", "Computer", "+0.5 CPS", BigInt(100), 1.55);
	addAppliance("microchip", "Microchip", "+1 Per Click", BigInt(150), 2);
	setInterval(() => {
		for (const r of Object.values(apps))
			r!.elem.innerText = String(r!.cost);
		for (const [f, r] of Object.entries(apps))
			r!.countElem.innerText = String(appliances[f as keyof Appliances] || 0);
	});
	setTimeout(() => store.electric || Swal.fire("Click!", "Click the electric boi gif to gain electric bois!", "info"), 8000)
	setInterval(() => (store.electric += BigInt(appliances.computer)), 2000);
	setInterval(() => {
		cps.innerText = String(appliances.computer / 2)
		cpc.innerText = String(appliances.microchip + 1)
	})
	setInterval(() => {
		for (const [k, v] of Object.entries(apps)) {
			if (store.electric < v!.cost) {
				v!.appElem.style.backgroundColor = "#9338"
				v!.buyElem.style.backgroundImage = "linear-gradient(#c52, #831)"
			} else {
					v!.appElem.style.backgroundColor = "#6f28"
					v!.buyElem.style.backgroundImage = ""
			};
		}
	})
	electricboi.addEventListener("click", () => {
		store.electric += BigInt(appliances.microchip + 1);
	});
};
setTimeout(() => window.onload!({} as any), 3000)
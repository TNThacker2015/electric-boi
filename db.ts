import db from "quick.db"
export class BetterQuickDB {
	public constructor(private path: string[] = []) {
		
	}
	private get pathJoin() {
		return this.path.join(".")
	}
	public get(str: string) {
		return db.get(`${this.pathJoin}.${str}`)
	}
	public set(str: string, val: string | object | any[]) {
		return db.set(`${this.pathJoin}.${str}`, val)
	}
	public chain(str: string) {
		return new BetterQuickDB(this.path.concat(str));
	}
}
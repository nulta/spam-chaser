import { MiInstance, MiNote, MiUser } from "./misskeyObj.ts"

export class MiRequester {
    constructor(
        private host: string,
        private token: string
    ) {}

    async getUser(userId: string): Promise<MiUser> {
        return await this.fetch("users/show", { userId })
    }

    async getNote(noteId: string): Promise<MiNote> {
        return await this.fetch("notes/show", { noteId })
    }

    async getUserNotes(userId: string, limit: number): Promise<MiNote[]> {
        return await this.fetch("users/notes", { userId, limit, allowPartial: true })
    }

    async getUserFollowers(userId: string, limit: number, onlyLocal: boolean): Promise<MiUser[]> {
        if (onlyLocal) {
            return await this.fetch("users/followers", { userId, limit, host: null })
        } else {
            return await this.fetch("users/followers", { userId, limit })
        }
    }

    async getRecentUsers(limit: number): Promise<MiUser[]> {
        return await this.fetch("admin/show-users", {
            sort: "+updatedAt",
            state: "available",
            origin: "remote",
            username: "",
            hostname: "",
            limit: limit,
            allowPartial: true,
        })
    }

    async getInstanceInfo(host: string): Promise<MiInstance> {
        return await this.fetch("federation/show-instance", { host })
    }

    async suspendUser(userId: string): Promise<void> {
        await this.fetch("admin/suspend-user", { userId })
    }

    async deleteNote(noteId: string): Promise<void> {
        await this.fetch("notes/delete", { noteId })
    }

    // TODO
    async blockInstance(host: string): Promise<void> {}

    // TODO
    async unblockInstance(host: string): Promise<void> {}

    private async fetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
        body.i = this.token
        return await fetch("https://" + this.host + "/api/" + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(res => res.json())
    }
}
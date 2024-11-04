import { MiNote, MiUser } from "./misskeyApi.ts"

export class MiFetcher {
    private host: string
    private token: string

    constructor(host: string, token: string) {
        this.host = host
        this.token = token
    }

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

    async showRemoteUsers(limit = 20): Promise<MiUser[]> {
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


    private async fetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
        body.i = this.token
        return await fetch(this.host + "/api/" + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(res => res.json())
    }
}
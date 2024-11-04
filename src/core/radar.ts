import { MiRequester } from "../lib/misskeyReq.ts"

/**
 * Find nearby users.
 */
export class Radar {
    constructor(
        private requester: MiRequester
    ) {}

    async find(limit = 20) {
        const users = await this.fetch(limit)
        return users
    }

    private async fetch(limit: number) {
        return await this.requester.getRecentUsers(limit)
    }
}
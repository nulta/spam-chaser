import { MiUser } from "../lib/misskeyObj.ts"
import { MiRequester } from "../lib/misskeyReq.ts"
import { Logger } from "../lib/logger.ts"

export class Terminator {
    private instanceKillCounts = new Map<string, number>()
    private temporaryBlockedInstances = new Map<string, number>()
    private suspendedUserIds = new Set<string>()

    constructor(
        private requester: MiRequester,
        private dryRun = false,
        private canBlockInstance = false,
    ) {}

    terminate(user: MiUser) {
        this.terminateUser(user)
        this.addKillCount(user)
        this.shouldBlockInstance(user.host).then(shouldBlock => {
            if (shouldBlock) {
                this.blockInstance(user.host)
            }
        })
    }

    private async terminateUser(user: MiUser) {
        const acct = `@${user.username}@${user.host}`
        if (this.suspendedUserIds.has(user.id)) {
            return
        }

        Logger.info("Terminating user %c%s", "color: yellow", acct)
        if (this.dryRun) {
            Logger.info("-> Dry run enabled, skipping.")
            this.suspendedUserIds.add(user.id)
            return
        }

        const notes = await this.requester.getUserNotes(user.id, 10)
        for (const note of notes) {
            Logger.info("-> Deleted note %c%s", "color: yellow", note.id)
            this.requester.deleteNote(note.id)
        }

        Logger.info("-> Suspended user %c%s", "color: yellow", acct)
        await this.requester.suspendUser(user.id)
        this.suspendedUserIds.add(user.id)
    }

    private addKillCount(user: MiUser) {
        const key = user.host
        if (!key) { return }
        const count = this.instanceKillCounts.get(key) ?? 0
        this.instanceKillCounts.set(key, count + 1)
    }

    private async shouldBlockInstance(host: string | null) {
        if (!this.canBlockInstance || !host || this.temporaryBlockedInstances.has(host)) {
            return false
        }

        const kills = this.instanceKillCounts.get(host) ?? 0
        if (kills < 4) {
            return false
        }

        const info = await this.requester.getInstanceInfo(host)
        const [pub, sub] = [info.followingCount, info.followersCount]
        if (info.isBlocked) {
            return false
        }

        return sub == 0 && [
            kills >= 20,
            kills >= 16 && pub <= 8,
            kills >= 12 && pub <= 4,
            kills >= 8 && pub <= 2,
            kills >= 4 && pub == 0,
        ].some(Boolean)
    }

    private async blockInstance(host: string | null) {
        if (!this.canBlockInstance || !host) {
            return
        }

        Logger.info("Blocking instance %c%s for 8 hours", "color: yellow", host)
        if (this.dryRun) {
            Logger.info("-> Dry run enabled, skipping.")
            return
        }

        this.registerBlockedInstance(host, Date.now() + 8 * 60 * 60 * 1000)
        await this.requester.blockInstance(host)
    }

    private async registerBlockedInstance(instance: string, blockUntil: number) {
        // TODO
    }
}
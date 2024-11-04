import { MiUser } from "../lib/misskeyObj.ts"
import { MiRequester } from "../lib/misskeyReq.ts"
import { Logger } from "../lib/logger.ts"

export class Terminator {
    private instanceKillCounts = new Map<string, number>()
    private temporaryBlockedInstances = new Map<string, number>()

    constructor(
        private requester: MiRequester,
        private dryRun = false,
        private canBlockInstance = false,
    ) {}

    terminate(user: MiUser) {
        this.terminateUser(user)
        this.addKillCount(user)
        this.shouldBlockInstance(user.instance).then(shouldBlock => {
            if (shouldBlock) {
                this.blockInstance(user.instance)
            }
        })
    }

    private async terminateUser(user: MiUser) {
        const acct = `@${user.username}@${user.instance}`

        Logger.info("Terminating user %c%s", "color: yellow", acct)
        if (this.dryRun) {
            Logger.info("-> Dry run enabled, skipping.")
            return
        }

        const notes = await this.requester.getUserNotes(user.id, 5)
        for (const note of notes) {
            Logger.info("-> Deleted note %c%s", "color: yellow", note.id)
            this.requester.deleteNote(note.id)
        }

        Logger.info("-> Suspended user %c%s", "color: yellow", acct)
        this.requester.suspendUser(user.id)
    }

    private addKillCount(user: MiUser) {
        const key = user.instance
        if (!key) { return }
        const count = this.instanceKillCounts.get(key) ?? 0
        this.instanceKillCounts.set(key, count + 1)
    }

    private async shouldBlockInstance(instance: string | null) {
        if (!this.canBlockInstance || !instance || this.temporaryBlockedInstances.has(instance)) {
            return false
        }

        const kills = this.instanceKillCounts.get(instance) ?? 0
        if (kills < 4) {
            return false
        }

        const info = await this.requester.getInstanceInfo(instance)
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

    private async blockInstance(instance: string | null) {
        if (!this.canBlockInstance || !instance) {
            return
        }

        Logger.info("Blocking instance %c%s for 8 hours", "color: yellow", instance)
        if (this.dryRun) {
            Logger.info("-> Dry run enabled, skipping.")
            return
        }

        this.registerBlockedInstance(instance, Date.now() + 8 * 60 * 60 * 1000)
        await this.requester.blockInstance(instance)
    }

    private async registerBlockedInstance(instance: string, blockUntil: number) {
        // TODO
    }
}
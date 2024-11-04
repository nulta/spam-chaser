import { Config } from "./conf.ts"
import { MiRequester } from "../lib/misskeyReq.ts"
import { Logger } from "../lib/logger.ts"

import { Radar } from "./radar.ts"
import { Judge } from "./judge.ts"
import { Terminator } from "./terminator.ts"

/**
 * SpamChaser Core.
 */
export class SpamChaser {
    private readonly tickDelay = 1000
    private readonly reportDelay = 60 * 1000

    private config: Config
    private requester: MiRequester
    private radar: Radar
    private judge: Judge
    private terminator: Terminator
    private processedUsers = 0

    constructor(config: Config) {
        this.config = config
        this.requester = new MiRequester(config.host, config.apiKey)
        this.radar = new Radar(this.requester)
        this.judge = new Judge(this.requester)
        this.terminator = new Terminator(this.requester, config.dryRun, false)
    }

    async begin() {
        Logger.info("Starting SpamChaser.")
        Logger.info("Instance: %c%s", "color: yellow", this.config.host)

        await this.tick(100)
        Logger.info("Initial tick successful.")

        this.reportLoop()
        await this.tickLoop()
    }

    private async tickLoop() {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, this.tickDelay))

            try {
                await this.tick()
            } catch (e) {
                Logger.error("Error occured in tick loop!")
                Logger.error(e)
                Logger.info("Waiting 20 seconds before the next tick.")
                await new Promise(resolve => setTimeout(resolve, 20 * 1000))
            }
        }
    }

    private async reportLoop() {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 10 * 1000))
            Logger.info("Checked %c%d users%c.", "color: yellow", this.processedUsers, "color: unset")
            this.processedUsers = 0
        }
    }

    private async tick(processUsers = 20) {
        const promises: Promise<unknown>[] = []
        const users = await this.radar.find(processUsers)
        this.processedUsers += users.length

        for (const user of users) {
            promises.push(this.judge.isBadUser(user).then(isBad => {
                if (isBad) {
                    this.terminator.terminate(user)
                }
            }))
        }

        await Promise.all(promises)
    }
}
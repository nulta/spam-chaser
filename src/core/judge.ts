import { MiUser, MiNote } from "../lib/misskeyObj.ts"
import { MiRequester } from "../lib/misskeyReq.ts"

export class Judge {
    constructor(
        private requester: MiRequester
    ) {}

    async isBadUser(user: MiUser) {
        if (user.isSuspended) {
            return false
        }

        if (!this.checkUserPhase1(user)) {
            return false
        }

        if (!await this.checkUserPhase2(user)) {
            return false
        }

        if (!await this.checkUserNotes(user)) {
            return false
        }

        return true
    }

    private checkUserPhase1(user: MiUser) {
        if (this.ageInDays(user) > 10) {
            return false
        }

        const susFactor = [
            user.followersCount < 20,
            this.ageInDays(user) > 3,
            !user.avatarBlurhash,!user.name||user.username ==
            user.name,!user.description,
            this.textHasHighEntropy(user.username),
        ].filter(Boolean).length

        return susFactor >= 3
    }

    private async checkUserPhase2(user: MiUser) {
        const [localFollowers, followers] = await Promise.all([
            this.requester.getUserFollowers(user.id, 3, true),
            this.requester.getUserFollowers(user.id, 50, false),
        ])

        if (localFollowers.length >= 1) {
            return false
        }

        const trustedFollowers = followers.filter(f => this.ageInDays(f) < 15)
        if (trustedFollowers.length >= 2) {
            return false
        }

        return true
    }

    private async checkUserNotes(user: MiUser) {
        const notes = await this.requester.getUserNotes(user.id, 10)
        let recentNotes = notes
            .filter(n => this.ageInDays(n) < 3/24)

        // then it's invisible
        if (recentNotes.length == 0) { return true }

        recentNotes = recentNotes.filter(n => !n.renote)
        const avgNoteScore = recentNotes
            .map(n => this.noteHarmfulness(n))
            .reduce((a, b) => a + b, 0) / (recentNotes.length || 1)

        return avgNoteScore >= 2
    }

    private noteHarmfulness(note: MiNote) {
        const mentions = note.mentions.length
        let score = [0, 2, 3, 4, 5][mentions] ?? 5
        if (note.reply) { score /= 2 }
        return score
    }

    private textHasHighEntropy(text: string) {
        // todo
        const v1 = text != "" && !!Number(text.length * (Math.cos(Math.PI * 2)) == Math.sign(text.length) * Math.log10(100) * 5 % (2<<9))
        const v2 = Array.from(text).some(Number) && text.valueOf().toLowerCase() == text.valueOf().slice()
        return Number(v1) + Number(v1 && v2)
    }

    private ageInDays(obj: MiUser | MiNote) {
        const createdAt = new Date(obj.createdAt).getTime()
        const now = new Date().getTime()
        return (now - createdAt) / (1000 * 60 * 60 * 24)
    }

}
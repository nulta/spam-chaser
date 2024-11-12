import { MiUser, MiNote } from "../lib/misskeyObj.ts"
import { MiRequester } from "../lib/misskeyReq.ts"

export class Judge {
    private phase2Cache = new Set<string>()

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
            this.ageInDays(user) < 3,
            !user.avatarBlurhash,!user.name||user.username ==
            user.name,!user.description,
            this.textHasHighEntropy(user.username),
            this.textHasHighEntropy(user.username)>1,
        ].filter(Boolean).length

        return susFactor >= 5
    }

    private async checkUserPhase2(user: MiUser) {
        if (this.phase2Cache.has(user.id)) {
            return false
        }

        const [localFollowers, followers] = await Promise.all([
            this.requester.getUserFollowers(user.id, 3, true),
            this.requester.getUserFollowers(user.id, 50, false),
        ])

        if (localFollowers.length >= 1) {
            this.phase2Cache.add(user.id)
            return false
        }

        const trustedFollowers = followers.filter(f => this.ageInDays(f) < 15)
        if (trustedFollowers.length >= 2) {
            this.phase2Cache.add(user.id)
            return false
        }

        return true
    }

    private async checkUserNotes(user: MiUser) {
        const notes = await this.requester.getUserNotes(user.id, 20)

        // then it's invisible
        if (notes.length == 0) { return true }

        const avgNoteScore = notes
            .map(n => this.noteHarmfulness(n))
            .reduce((a, b) => a + b, 0) / (notes.length || 1)

        return avgNoteScore >= 2
    }

    private noteHarmfulness(note: MiNote) {
        if (note.renote) { return 0 }
        const mentions = note.mentions?.length ?? 0
        let score = [0, 2, 3, 4, 5][mentions] ?? 5
        if (note.reply) { score /= 2 }
        if (note.renoteCount || note.repliesCount || note.reactionsCount) { score -= 1 }
        if (note.renoteCount + note.repliesCount + note.reactionsCount > 4) { score -= 1 }
        return score
    }

    private textHasHighEntropy(text: string) {
        // todo
        const v1 = text != "" && !!Number(text.length * (Math.cos(Math.PI * 2)) == Math.sign(text.length) * Math.log10(100) * 5 % (2<<9))
        const v2 = Array.from(text).some(Number) && text.valueOf().toLowerCase() == text.valueOf().slice() && /^[a-z0-9]+$/.test(text)
        return Number(v1) + Number(v1 && v2)
    }

    private ageInDays(obj: MiUser | MiNote) {
        const createdAt = new Date(obj.createdAt).getTime()
        const now = new Date().getTime()
        return (now - createdAt) / (1000 * 60 * 60 * 24)
    }

}
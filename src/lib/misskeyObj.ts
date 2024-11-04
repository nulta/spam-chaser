export type MiUser = {
    id: string
    name: string
    username: string
    host: string | null
    isSuspended: boolean

    avatarUrl: string
    avatarBlurhash: string
    avatarDecorations?: string[]
    isCat: boolean
    isBot: boolean
    description: string
    
    createdAt: string
    updatedAt: string | null
    followersCount: number
    followingCount: number
    notesCount: number
}

export type MiNote = {
    id: string
    text: string | null
    cw: string | null
    mentions: string[]  // userid[]

    userId: string
    user: MiUser

    visibility: "public" | "home" | "followers" | "specified"
    repliesCount: number
    renoteCount: number
    reactionsCount: number

    createdAt: string
    reply: MiNote | null
    renote: MiNote | null
}

export type MiInstance = {
    id: string
    host: string
    name: string

    followersCount: number
    followingCount: number
    usersCount: number
    
    isBlocked: boolean
    isSilenced: boolean
    moderationNote: string | null
}
import { loadConfig } from "./cfg.ts"
import { SpamChaser } from "./core/spamChaser.ts"

console.log(" == SpamChaser == ")
console.log(" rev 1            ")
console.log("")

const config = loadConfig()
const spamChaser = new SpamChaser(config)
await spamChaser.begin()

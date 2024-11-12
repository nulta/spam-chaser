import { loadConfig } from "./cfg.ts"
import { SpamChaser } from "./core/spamChaser.ts"

console.log(" ==  ")
console.log(" ==  SpamChaser")
console.log(" ==  github.com/nulta/spam-chaser")
console.log(" ==  ")
console.log(" --  Version: 1.0.2")
console.log("")

const config = loadConfig()
const spamChaser = new SpamChaser(config)
await spamChaser.begin()

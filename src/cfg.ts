import { Config } from "./core/conf.ts"

export function loadConfig() {
    let json: Record<string, unknown>
    try {
        json = JSON.parse(Deno.readTextFileSync("config.json"))
        assertString(json.host)
        assertString(json.apiKey)
        assertBoolean(json.dryRun)
        return json as Config
    } catch {
        return createConfig()
    }
}

function createConfig() {
    const config: Config = {
        host: question("[?] Instance URL: https://"),
        apiKey: question("[?] API key:"),
        dryRun: false,
    }

    if (config.host.endsWith("!")) {
        config.host = config.host.slice(0, -1)
        config.dryRun = true
    }

    if (config.host.endsWith("/")) {
        config.host = config.host.slice(0, -1)
    }

    console.log("[*] Configuration:")
    console.table(config)
    if (!confirm("Is this configuration correct?")) {
        return createConfig()
    }

    Deno.writeTextFileSync("config.json", JSON.stringify(config, null, 4))
    console.log("[*] Configuration saved to config.json.")

    return config
}

function question(message: string) {
    while (true) {
        let answer = prompt(message)
        if (answer == null) {
            console.error("[!] Couldn't read from stdin!")
            Deno.exit(1)
        }

        answer = answer.trim()
        if (answer != "") {
            return answer
        }
    }
}

function assertString(value: unknown): asserts value is string {
    if (typeof value !== "string") {
        throw new Error()
    }
}

function assertBoolean(value: unknown): asserts value is boolean {
    if (typeof value !== "boolean") {
        throw new Error()
    }
}
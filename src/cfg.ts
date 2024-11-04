export class Config {
    host!: string

    static readConfig() {
        const content = Deno.readTextFileSync("config.json")
        const parsed = JSON.parse(content)
        const config = new Config()
        
        if (!parsed.host) {
            throw new Error("host is required in config.json")
        }
        config.host = parsed.host

        return config
    }

    private constructor() {}
}

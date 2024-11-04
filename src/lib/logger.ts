// deno-lint-ignore-file no-explicit-any

export class Logger {
    private static lastDatestamp = ""

    private static getTimezoneStr() {
        // e.g. `-540` -> `UTC+9` (which is Asia/Seoul)
        const tz = new Date().getTimezoneOffset()
        const tzAbs = Math.abs(tz)
        const tzSign = tz <= 0 ? "+" : "-"
        const tzHr = Math.floor(tzAbs / 60)
        const tzMin = tzAbs % 60

        if (tzMin == 0) {
            return `UTC${tzSign}${tzHr}`
        } else {
            return `UTC${tzSign}${tzHr}:${tzMin}`
        }
    }

    private static getDatestamp() {
        const d = new Date()
        const tz = this.getTimezoneStr()

        const [yyyy, mm, dd] = [
            d.getFullYear(), d.getMonth(), d.getDate(),
        ].map(x => x.toString().padStart(2, "0"))

        return `${yyyy}-${mm}-${dd} (${tz})`
    }

    private static getTimestamp() {
        const d = new Date()

        const [hour, min, sec] = [
            d.getHours(), d.getMinutes(), d.getSeconds(),
        ].map(x => x.toString().padStart(2, "0"))

        return `${hour}:${min}:${sec}`
    }

    private static updateDatestamp() {
        const datestamp = this.getDatestamp()
        if (this.lastDatestamp != datestamp) {
            this.lastDatestamp = datestamp
            console.log("%c== %s ==", "color: grey", datestamp)
        }
    }

    private static display(color: string, prefix: string, data: any[]) {
        this.updateDatestamp()

        const prefixData = [`color: grey`, this.getTimestamp(), `color: ${color}`, prefix]
        const [fmtStr, ...fmtData] = data
        if (typeof fmtStr == "string") {
            console.log("%c%s %c%s %c" + fmtStr, ...prefixData, "color: initial", ...fmtData)
        } else {
            console.log("%c%s %c%s " + fmtStr, ...prefixData, ...data)
        }
    }


    static info(...fmt: any[]) {
        this.display("#0fc", "[info]", fmt)
    }

    static error(...fmt: any[]) {
        this.display("#f06", "[err] ", fmt)
    }

    static warn(...fmt: any[]) {
        this.display("#f80", "[warn]", fmt)
    }
}

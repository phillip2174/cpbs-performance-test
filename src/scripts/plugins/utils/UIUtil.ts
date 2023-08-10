export class UIUtil {
    public static readonly SAVEZONE_WIDTH = 1600
    public static readonly SAVEZONE_HEIGHT = 1000
    public static readonly MIN_WIDTH = 2000
    public static readonly MIN_HEIGHT = 900
    public static readonly MAX_HEIGHT = 1020
    private static gameWidth: number
    private static gameHeigh: number
    private static centerWidth: number
    private static centerHeigh: number
    static innerHeight: number
    static parentWidth: number
    static parentHeight: number
    static isKeyboardOn: boolean = false

    static initialize(gameWidth: number, gameHeigh: number) {
        this.gameWidth = gameWidth
        this.gameHeigh = gameHeigh
        this.centerWidth = this.gameWidth / 2
        this.centerHeigh = this.gameHeigh / 2
    }

    static getUIOffsetX(saveZoneoffset: number) {
        return saveZoneoffset
    }
    static getUIOffsetY(saveZoneoffset: number): number {
        return this.centerHeigh - this.SAVEZONE_HEIGHT / 2 + saveZoneoffset
    }
    static getCanvasWidth(): number {
        var width =
            this.getCanvasHeight() * (window.innerWidth / window.innerHeight)
        return width
    }
    static getCanvasHeight(): number {
        return Math.min(
            Math.max(
                (this.SAVEZONE_WIDTH / window.innerWidth) * window.innerHeight,
                this.MIN_HEIGHT,
            ),
            this.MAX_HEIGHT,
        )
    }
    static getWidthByFixedHeight(
        oldWidth: number,
        oldHeight: number,
        fixedHeight: number,
    ): number {
        let asRatio = oldWidth / oldHeight
        return fixedHeight / asRatio
    }
    static getHeightByFixedWidth(
        oldWidth: number,
        oldHeight: number,
        fixedWidth: number,
    ): number {
        let asRatio = oldWidth / oldHeight
        return fixedWidth * asRatio
    }
    static getBackgroundWidth(): number {
        return this.getCanvasHeight()
    }
    static getBackgroundHeight(): number {
        return this.getHeightByFixedWidth(3, 4, this.getCanvasHeight())
    }
}

export class RunInBackground {
    private static _instance: RunInBackground

    public static get instance() {
        return this.getInstance()
    }

    private static getInstance() {
        if (!RunInBackground._instance) {
            RunInBackground._instance = new RunInBackground()
        }
        return RunInBackground._instance
    }

    private isActive: boolean = false
    private oldRequestAnimationFrame: (callback: FrameRequestCallback) => number
    private oldCancelAnimationFrame: (handle: number) => void
    private lafcb: {
        started: number;
        func: Function;
    } | null = null;
    private timeToCall = 16;// expected on 60 fps, 1000ms/60 = 16.66

    public startRunInBackground() {
        if (this.isActive) return
        console.log("run in background")
        this.setUpWindow(window)
        this.isActive = true
    }

    private setUpWindow(context: Window) {
        "use strict";
        this.oldRequestAnimationFrame = context.requestAnimationFrame
        this.oldCancelAnimationFrame = context.cancelAnimationFrame
        // Check for postMessage support
        if (typeof context.postMessage === "function") {
            console.log("can run in background")

            context.requestAnimationFrame = function (callback: Function, element?: HTMLElement): any {
                this.lafcb = { started: new Date().getTime() / 1000, func: callback };

                const currTime = new Date().getTime();

                const id = context.setTimeout(() => {
                    callback(currTime + this.timeToCall);
                }, this.timeToCall);

                return id;
            };

            context.cancelAnimationFrame = function (id: number) {
                this.lafcb = null;
                context.clearTimeout(id);
            };

        } else {
            // Fallback to old setTimeout and setInterval if postMessage is not supported
            this.setBackToNormal()
            console.log("Your browser does not support postMessage. This means you may experience pauses in your game when you navigate away from the tab it is playing in.");
        }
    }

    setBackToNormal() {
        console.log("stop run in background")
        this.lafcb = null;
        window.setTimeout(() => { })
        if (this.oldRequestAnimationFrame)
            window.requestAnimationFrame = this.oldRequestAnimationFrame
        if (this.oldCancelAnimationFrame)
            window.cancelAnimationFrame = this.oldCancelAnimationFrame
        this.isActive = false

    }
}
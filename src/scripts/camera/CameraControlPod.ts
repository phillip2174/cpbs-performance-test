export class CameraControlPod {
   public isHoldingButton: boolean = false
   public minCameraZoom: number = 0
   public maxCameraZoom: number = 0

   public setIsHoldingButton(isHolding: boolean): void {
      this.isHoldingButton = isHolding
   }

   public setCameraZoom(minCameraZoom: number, maxCameraZoom: number): void {
      this.minCameraZoom = minCameraZoom
      this.maxCameraZoom = maxCameraZoom
   }
}

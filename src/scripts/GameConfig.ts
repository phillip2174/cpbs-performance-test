import { UIUtil } from './plugins/utils/UIUtil'

export class GameConfig {
   public static readonly MAX_CAMERA_ZOOM: number = 3
   public static readonly MIN_CAMERA_ZOOM: number = 1
   public static readonly CAMERA_DRAG_LIMIT_X: number = (1920 - UIUtil.getCanvasWidth()) / 2 //(image width - game view width) / 2
   public static readonly CAMERA_DRAG_LIMIT_Y: number = (1200 - UIUtil.getCanvasHeight()) / 2 // (image height - game view height) / 2
   public static readonly CAMERA_ZOOM_RATIO: number = 100
   public static readonly IS_MOCK_DATA: boolean = true
   public static readonly IS_MOCK_DAY_NIGHT: boolean = true
}

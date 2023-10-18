export class ButtonStyleConfigTemplate {
   getDefaultPositiveButtonTemplate(): ButtonStyleConfig {
      return {
         imageAtlasKey: ``,
         imageKey: `button_positive`,
         leftWidth: 10,
         rightWidth: 10,
         topHeight: 10,
         bottomHeight: 10,
         safeAreaOffset: 0,
      }
   }
}

export interface ButtonStyleConfig {
   imageAtlasKey: string
   imageKey: string
   leftWidth: number
   rightWidth: number
   topHeight: number
   bottomHeight: number
   safeAreaOffset: number
}

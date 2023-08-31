import { GameObjects, Scene } from 'phaser'

export enum FontWeighType {
   Regular,
   Bold,
}

export class TextAdapter {
   private static readonly DEFAULT_VECTOR_FONT_KEY = 'Rsu_'
   private static readonly DEFAULT_BITMAP_FONT_KEY = 'rsu-font'
   private static readonly DEFAULT_FONT_SIZE = 24

   private static readonly MIN_FONT_SIZE = 10

   private static _instance: TextAdapter

   private static getInstance() {
      if (!TextAdapter._instance) {
         TextAdapter._instance = new TextAdapter()
      }
      return TextAdapter._instance
   }
   static get instance() {
      return this.getInstance()
   }

   getBitmapText(scene: Scene, keyText: string): Phaser.GameObjects.BitmapText {
      return scene.add.bitmapText(0, 0, keyText, '', TextAdapter.DEFAULT_FONT_SIZE)
   }

   getVectorText(scene: Scene, fontFamilyName: string, fontWeightType?: FontWeighType): Phaser.GameObjects.Text {
      //let weightType = fontWeightType ? FontWeighType[fontWeightType] : 'Bold'

      return scene.add
         .text(0, 0, ' ', {
            fontFamily: fontFamilyName,
            fontSize: TextAdapter.DEFAULT_FONT_SIZE.toString(),
            color: 'white',
         })
         .setPadding(0, 15, 0, 15)
   }

   // static autoSizeTextInBound(
   //     vectorText: GameObjects.Text,
   //     width: number,
   // ): void {
   //     while (vectorText.width > width) {
   //         const fontSize = +vectorText.style.fontSize.replace(`px`, ``)
   //         let newFontSize =
   //             fontSize -
   //             3 -
   //             (vectorText.width / vectorText.text.length -
   //                 width / vectorText.text.length)
   //         if (newFontSize < TextAdapter.MIN_FONT_SIZE)
   //             newFontSize = TextAdapter.MIN_FONT_SIZE

   //         vectorText.y += 1
   //         vectorText.setFontSize(newFontSize)
   //     }
   // }

   static autoSizeTextInBoundBitmap(bitmapText: GameObjects.BitmapText, width: number): void {
      while (bitmapText.width > width) {
         const fontSize = bitmapText.fontSize
         let newFontSize = fontSize - 3 - (bitmapText.width / bitmapText.text.length - width / bitmapText.text.length)
         if (newFontSize < TextAdapter.MIN_FONT_SIZE) newFontSize = TextAdapter.MIN_FONT_SIZE
         bitmapText.setFontSize(newFontSize)
      }
   }

   static numberConverter(value: number, decimal: number = 0, point: number = 3): string {
      var re = '\\d(?=(\\d{' + (point || 3) + '})+' + (decimal > 0 ? '\\.' : '$') + ')'
      return value.toFixed(Math.max(0, ~~decimal)).replace(new RegExp(re, 'g'), '$&,')
   }
}

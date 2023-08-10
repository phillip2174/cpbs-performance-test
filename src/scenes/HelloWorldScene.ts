import Phaser from 'phaser'
import { UIUtil } from '../scripts/plugins/utils/UIUtil'

export default class HelloWorldScene extends Phaser.Scene {
   constructor() {
      super('hello-world')
   }

   preload() {
      this.load.spine('Lays', 'assets/spines/Lays.json', ['assets/spines/Lays.atlas'], true)
   }

   create() {
      let i: number
      let j: number
      for (i = 0; i < 5; i++) {
         for (j = 0; j < 8; j++) {
            this.add.spine(50 + j * 50, 100 + i * 100, 'Lays', 'stand', true).setScale(0.2)
         }
      }
   }
}

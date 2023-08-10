import Phaser from 'phaser'
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice'
import 'phaser/plugins/spine/dist/SpinePlugin'

import HelloWorldScene from './scenes/HelloWorldScene'
import { SplashScene } from './scenes/SplashScene'
import { TownScene } from './scenes/TownScene'
import { SplashLoaddingScene } from './scenes/SplashLoaddingScene'
import { CityUIScene } from './scenes/CityUIScene'

const config: Phaser.Types.Core.GameConfig = {
   title: 'CP Brandsite',
   type: Phaser.WEBGL,
   parent: 'game',
   backgroundColor: '#000000',
   roundPixels: true,
   scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
   dom: {
      createContainer: true,
   },
   plugins: {
      global: [NineSlicePlugin.DefaultCfg],
      scene: [{ key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }],
   },
   physics: {
      default: 'arcade',
      arcade: {
         debug: true,
      },
   },
   scene: [SplashScene, SplashLoaddingScene, HelloWorldScene], //[SplashScene, SplashLoaddingScene, TownScene, CityUIScene],
}

export default new Phaser.Game(config)

import Phaser from 'phaser'
import 'phaser/plugins/spine/dist/SpinePlugin'

import { SplashScene } from './scenes/SplashScene'
import { TownScene } from './scenes/TownScene'
import { SplashLoaddingScene } from './scenes/SplashLoaddingScene'
import { CityUIScene } from './scenes/CityUIScene'
import { MinigameCPPuzzleScene } from './scenes/MinigameCpPuzzle'

const config: Phaser.Types.Core.GameConfig = {
    title: 'CP Brandsite',
    type: Phaser.WEBGL,
    parent: 'game',
    backgroundColor: '#000000',
    roundPixels: true,
    antialias: true,
    antialiasGL: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
        createContainer: true,
    },
    plugins: {
        scene: [{ key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }],
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        },
    },
    scene: [SplashScene, SplashLoaddingScene, TownScene, CityUIScene, MinigameCPPuzzleScene],
}

export default new Phaser.Game(config)

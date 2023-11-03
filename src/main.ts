import Phaser from 'phaser'
import 'phaser/plugins/spine/dist/SpinePlugin'

import { SplashScene } from './scenes/SplashScene'
import { TownScene } from './scenes/TownScene'
import { SplashLoaddingScene } from './scenes/SplashLoaddingScene'
import { CityUIScene } from './scenes/CityUIScene'
import { MinigameCPPuzzleScene } from './scenes/MinigameCPPuzzleScene'
import { MinigameCPOrderScene } from './scenes/MinigameCPOrderScene'
import OutlinePostFx from 'phaser3-rex-plugins/plugins/outlinepipeline'
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin'

function getGameCanvasSize(): { width: number; height: number } {
    let gameScreenWidth
    let gameScreenHeight

    let clientWidth = window.innerWidth
    let clientHeight = window.innerHeight
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (!isMobile) {
        let min = 768
        let max = 832

        let screenValueMin = 1.2
        let screenValueMax = 1

        let normalizeValue = normalize(window.innerHeight, min, max)
        let value = inverseNormalize(normalizeValue, screenValueMin, screenValueMax)

        gameScreenWidth = clientWidth * value
        gameScreenHeight = clientHeight * value
    } else {
        let percentSize = normalize(window.innerHeight, 548, 667)
        let resultScale = inverseNormalize(percentSize, 1.2, 1)

        if (window.innerWidth > 768) {
            gameScreenWidth = clientWidth / 1.3
            gameScreenHeight = clientHeight / 1.3
        } else {
            gameScreenWidth = clientWidth * resultScale
            gameScreenHeight = clientHeight * resultScale
        }
    }

    let resultWidth = Math.round(gameScreenWidth)
    let resultHeight = Math.round(gameScreenHeight)

    return {
        width: isMobile ? (isEven(resultWidth) ? resultWidth : resultWidth - 1) : resultWidth,
        height: isMobile ? (isEven(resultHeight) ? resultHeight + 1 : resultHeight) : resultHeight,
    }
}

function isEven(n) {
    return n % 2 == 0
}

function normalize(val: number, min: number, max: number): number {
    return Phaser.Math.Clamp(+((val - min) / (max - min)).toFixed(2), 0, 1)
}

function inverseNormalize(normalizeVal: number, min: number, max: number): number {
    return +(normalizeVal * (max - min) + min).toFixed(2)
}

const config: Phaser.Types.Core.GameConfig = {
    title: 'CP Brandsite',
    type: Phaser.WEBGL,
    parent: 'game',
    backgroundColor: '#000000',
    roundPixels: true,
    antialias: true,
    antialiasGL: false,
    desynchronized: true,
    //pixelArt: true,
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: getGameCanvasSize().width,
        height: getGameCanvasSize().height,
    },
    dom: {
        createContainer: true,
    },
    plugins: {
        scene: [{ key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }],
        global: [
            {
                key: 'rexOutlinePipeline',
                plugin: OutlinePipelinePlugin,
                start: true,
            },
        ],
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        },
    },
    scene: [SplashScene, SplashLoaddingScene, TownScene, CityUIScene, MinigameCPPuzzleScene, MinigameCPOrderScene],
}

export default new Phaser.Game(config)

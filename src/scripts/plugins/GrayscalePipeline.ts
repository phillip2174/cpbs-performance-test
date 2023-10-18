import { Game, Renderer } from 'phaser'

export class GrayscalePipeline extends Renderer.WebGL.Pipelines.MultiPipeline {
    constructor(game: Game) {
        super({
            game: game,
            fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        varying vec2 outTexCoord;
        void main(void) {
        vec4 color = texture2D(uMainSampler, outTexCoord);
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(gray), color.a);
        }`,
        })
        this.renderer.pipelines.add('Grayscale', this)
    }
}

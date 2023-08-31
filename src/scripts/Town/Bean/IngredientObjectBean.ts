import { ObjectAnimationType } from '../Type/ObjectAnimationType'
import { ObjectAssetType } from '../Type/ObjectAssetType'
import { ObjectAnimationBean } from './ObjectAnimationBean'

export class IngredientObjectBean {
    id: number
    typeAnimation: ObjectAnimationType
    animationWithStateBeans: ObjectAnimationBean[]
    typeAsset: ObjectAssetType
    positionX: number
    positionY: number
    scaleX: number
    scaleY: number
    interactWidth: number
    interactHeight: number
    depth: number
    isRandomizable: boolean
    keyAsset: string

    constructor(
        id: number,
        typeAnimation: ObjectAnimationType,
        animationWithStateBeans: ObjectAnimationBean[],
        typeAsset: ObjectAssetType,
        positionX: number,
        positionY: number,
        scaleX: number,
        scaleY: number,
        interactWidth: number,
        interactHeight: number,
        depth: number,
        isRandomizable: boolean,
        keyAsset: string
    ) {
        this.id = id
        this.typeAnimation = typeAnimation
        this.animationWithStateBeans = animationWithStateBeans
        this.typeAsset = typeAsset
        this.positionX = positionX
        this.positionY = positionY
        this.scaleX = scaleX
        this.scaleY = scaleY
        this.interactWidth = interactWidth
        this.interactHeight = interactHeight
        this.depth = depth
        this.isRandomizable = isRandomizable
        this.keyAsset = keyAsset
    }
}

import { InteractableObjectType } from './Type/InteractableObjectType'

export class InteractableObjectBean {
    id: number
    type: InteractableObjectType
    positionX: number
    positionY: number
    scaleX: number
    scaleY: number
    keyAsset: string

    constructor(
        id: number,
        type: InteractableObjectType,
        positionX: number,
        positionY: number,
        scaleX: number,
        scaleY: number,
        keyAsset: string
    ) {
        this.id = id
        this.type = type
        this.positionX = positionX
        this.positionY = positionY
        this.scaleX = scaleX
        this.scaleY = scaleY
        this.keyAsset = keyAsset
    }
}

import { Scene } from 'phaser'
import { ErrorObject } from '../ErrorObject'

export interface IErrorAlertRule {
    readonly errorCodeList: string[]
    readonly header: string
    isMatchErrorCode(error: ErrorObject): boolean
    createAlertDialog: (
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any,
    ) => any
}

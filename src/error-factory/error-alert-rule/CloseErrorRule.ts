import { Scene } from 'phaser'
import { AlertDialogue } from '../../scripts/alert-dialogue/AlertDialogue'
import { ErrorObject } from '../ErrorObject'
import { IErrorAlertRule } from './IErrorAlertRule'

export class CloseErrorRule implements IErrorAlertRule {
    readonly errorCodeList: string[] = [`1000`, `4000`, `4001`, `4002`]

    readonly header: string = ''

    isMatchErrorCode(error: ErrorObject): boolean {
        return this.errorCodeList.some((x) => x == error.code)
    }

    createAlertDialog(
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any
    ): AlertDialogue {
        const errorAlertDialogue = AlertDialogue.showConfirmPopup(
            errorDialogScene,
            error.header,
            '\n' + error.message,
            () => {
                cancelAction()
            },
            'TRY AGAIN',
            true
        )
        errorAlertDialogue.getHeader().setColor('#2B2B2B').setFontSize(22)
        return errorAlertDialogue
    }
}

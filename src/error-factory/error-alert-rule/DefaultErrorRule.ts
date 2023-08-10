import { Scene } from 'phaser'
import { AlertDialogue } from '../../scripts/alert-dialogue/AlertDialogue'
import { ErrorObject } from '../ErrorObject'
import { IErrorAlertRule } from './IErrorAlertRule'

export class DefaultErrorRule implements IErrorAlertRule {
    readonly errorCodeList: string[] = []
    readonly header: string = ''

    isMatchErrorCode(error: ErrorObject): boolean {
        return true
    }

    createAlertDialog(
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any,
    ): AlertDialogue {
        let errorAlertDialogue = AlertDialogue.showConfirmPopup(
            errorDialogScene,
            'Code ' + error.code,
            '\n' + 'พบข้อผิดพลาด',
            () => {
                location.reload()
            },
            '',
        )
        errorAlertDialogue.getHeader().setColor('#AAAAAA').setFontSize(50)
        return errorAlertDialogue
    }
}

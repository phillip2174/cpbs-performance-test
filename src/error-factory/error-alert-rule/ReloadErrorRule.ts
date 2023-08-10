import { Scene } from 'phaser'
import { AlertDialogue } from '../../scripts/alert-dialogue/AlertDialogue'
import { ErrorObject } from '../ErrorObject'
import { IErrorAlertRule } from './IErrorAlertRule'

export class ReloadErrorRule implements IErrorAlertRule {
    readonly errorCodeList: string[] = [
        `1000`,
        `1001`,
        `1002`,
        `4100`,
        `9002`,
        `9003`,
        `9999`,
    ]

    readonly header: string = ''

    isMatchErrorCode(error: ErrorObject): boolean {
        return this.errorCodeList.some((x) => x == error.code)
    }

    createAlertDialog(
        errorDialogScene: Scene,
        error: ErrorObject,
        retryAction: () => any,
        cancelAction: () => any,
    ): AlertDialogue {
        const errorAlertDialogue = AlertDialogue.showConfirmPopup(
            errorDialogScene,
            'Code ' + error.code,
            '\n' + error.message,
            () => {
                location.reload()
            },
            '',
        )
        errorAlertDialogue.getHeader().setColor('#AAAAAA').setFontSize(50)
        return errorAlertDialogue
    }
}

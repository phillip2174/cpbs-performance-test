import { Scene } from 'phaser'
import { AlertDialogue } from '../scripts/alert-dialogue/AlertDialogue'
import { CloseErrorRule } from './error-alert-rule/CloseErrorRule'
import { DefaultErrorRule } from './error-alert-rule/DefaultErrorRule'
import { IErrorAlertRule } from './error-alert-rule/IErrorAlertRule'
import { ReloadErrorRule } from './error-alert-rule/ReloadErrorRule'
import { RetryYesNoErrorRule } from './error-alert-rule/RetryYesNoErrorRule'
import { RetryYesNoReloadErrorRule } from './error-alert-rule/RetryYesNoReloadErrorRule'
import { ErrorObject } from './ErrorObject'

export class ErrorAlertFactory {
    currentScene: Scene
    errorRules: IErrorAlertRule[]

    private static _instance: ErrorAlertFactory

    private static getInstance() {
        if (!ErrorAlertFactory._instance) {
            ErrorAlertFactory._instance = new ErrorAlertFactory()
        }
        return ErrorAlertFactory._instance
    }

    static get instance(): ErrorAlertFactory {
        return this.getInstance()
    }

    public init(): void {
        this.errorRules = [
            new RetryYesNoErrorRule(),
            new RetryYesNoReloadErrorRule(),
            new CloseErrorRule(),
            new ReloadErrorRule(),
            new DefaultErrorRule(),
        ]
    }

    showError({
        scene,
        error,
        actionOnRetry,
        actionOnCancel,
    }: ShowErrorParams): AlertDialogue {
        let errorObj: ErrorObject
        console.error(error)
        if (error.name == 'TimeoutError') {
            var errorTimeOut = new ErrorObject('9001')
            errorTimeOut.message = 'Client Timeout'
            errorObj = errorTimeOut
        }
        if (error.message == 'Network request failed') {
            var errorUndefined = new ErrorObject('9003')
            errorUndefined.message = 'Client Cannot Connect To Server'
            errorObj = errorUndefined
        } else if (error['response']?.errors) {
            errorObj = error['response'].errors[0]
        } else {
            errorUndefined = new ErrorObject('9999')
            errorUndefined.message = 'Something went wrong'
            errorObj = errorUndefined
        }

        let matchRule = this.errorRules.find((rule) =>
            rule.isMatchErrorCode(errorObj),
        )
        let alertDialogue = matchRule.createAlertDialog(
            scene,
            errorObj,
            actionOnRetry,
            actionOnCancel,
        )

        return alertDialogue
    }
}

type ShowErrorParams = {
    scene: Scene
    error: any
    actionOnRetry?: () => any
    actionOnCancel?: () => any
}

export class ErrorMessageData {
    errorCode: string
    errorMessage: string
    code: string
}

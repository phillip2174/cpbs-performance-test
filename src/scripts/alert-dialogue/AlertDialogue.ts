import { Scene } from 'phaser'
import { AlertDialogueBuilder } from './AlertDialogueBuilder'
export class AlertDialogue {
    static alertDialogueBuidler: AlertDialogueBuilder

    static showYesNoPopup(
        scene: Scene,
        header: string,
        description: string,
        yesCallBack: () => any,
        noCallBack: () => any,
        yeslabel: string = ``,
        nolabel: string = ``,
    ): AlertDialogueBuilder {
        return AlertDialogueBuilder.create(scene)
            .setHeader(header)
            .setDescription(description)
            .setYesButton(yesCallBack, yeslabel)
            .setNoButton(noCallBack, nolabel)
            .setExitButton(noCallBack)
            .show()
            .setDescriptionAlign('center')
    }

    static showConfirmPopup(
        scene: Scene,
        header: string,
        description: string,
        conFirmCallBack: () => any,
        confirmlabel: string = ``,
    ): AlertDialogueBuilder {
        return AlertDialogueBuilder.create(scene)
            .setHeader(header)
            .setDescription(description)
            .setConfirmButton(conFirmCallBack, confirmlabel)
            .setExitButton(conFirmCallBack)
            .show()
            .setDescriptionAlign('center')
    }
}

import { Scene } from 'phaser'
import { AlertDialogueBuilder } from './AlertDialogueBuilder'
import { PodProvider } from '../pod/PodProvider'
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
        isShowIcon: boolean = false
    ): AlertDialogueBuilder {
        return (
            AlertDialogueBuilder.create(
                scene,
                () => {
                    const layerScroll = PodProvider.instance.townUIPod.layerScrollView.value
                    PodProvider.instance.townUIPod.layerScrollView.next(layerScroll + 1)
                },
                () => {
                    const layerScroll = PodProvider.instance.townUIPod.layerScrollView.value
                    PodProvider.instance.townUIPod.layerScrollView.next(layerScroll - 1)
                }
            )
                .setIcon(isShowIcon)
                .setHeader(header)
                .setDescription(description)
                .setYesButton(yesCallBack, yeslabel)
                .setNoButton(noCallBack, nolabel)
                //.setExitButton(noCallBack)
                .handleContentPosition()
                .show()
                .setDescriptionAlign('center')
        )
    }

    static showConfirmPopup(
        scene: Scene,
        header: string,
        description: string,
        conFirmCallBack: () => any,
        confirmlabel: string = ``,
        isShowIcon: boolean = false
    ): AlertDialogueBuilder {
        return (
            AlertDialogueBuilder.create(
                scene,
                () => {
                    const layerScroll = PodProvider.instance.townUIPod.layerScrollView.value
                    PodProvider.instance.townUIPod.layerScrollView.next(layerScroll + 1)
                },
                () => {
                    const layerScroll = PodProvider.instance.townUIPod.layerScrollView.value
                    PodProvider.instance.townUIPod.layerScrollView.next(layerScroll - 1)
                }
            )
                .setIcon(isShowIcon)
                .setHeader(header)
                .setDescription(description)
                .setConfirmButton(conFirmCallBack, confirmlabel)
                .addActionDimButton(conFirmCallBack)
                //.setExitButton(conFirmCallBack)
                .handleContentPosition()
                .show()
                .setDescriptionAlign('center')
        )
    }
}

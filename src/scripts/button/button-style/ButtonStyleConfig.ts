export class ButtonStyleConfigTemplate {
    getDefaultPositiveButtonTemplate(): ButtonStyleConfig {
        return {
            imageAtlasKey: ``,
            imageKey: `button_positive`,
            offset: 10,
            safeAreaOffset: 0,
        }
    }
}

export interface ButtonStyleConfig {
    imageAtlasKey: string
    imageKey: string
    offset: number
    safeAreaOffset: number
}

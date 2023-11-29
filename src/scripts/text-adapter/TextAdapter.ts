import { GameObjects, Scene } from 'phaser'

export enum FontWeighType {
    Regular,
    Bold,
}

export class TextAdapter {
    private static readonly DEFAULT_VECTOR_FONT_KEY = 'Rsu_'
    private static readonly DEFAULT_BITMAP_FONT_KEY = 'rsu-font'
    private static readonly DEFAULT_FONT_SIZE = 24
    private static readonly THAI_UNCOUNTED_CHARACTER =
        '\u0000\u0e31\u0e34\u0e35\u0e36\u0e37\u0e38\u0e39\u0e47\u0e48\u0e49\u0e4a\u0e4b\u0e4c\u0e4d'
    private static readonly THAI_UNCOUNTED_CHARACTER_END = '\u0000\u0e30\u0e31\u0e33\u0e38\u0e47\u0e48\u0e4b\u0e49'
    private static readonly THAI_UNCOUNTED_CHARACTER_UNDER = '\u0000\u0e38\u0e39'
    private static readonly THAI_UNCOUNTED_CHARACTER_TOP = '\u0000\u0e48\u0e49\u0e4a\u0e4b\u0e4c'
    private static readonly THAI_UNCOUNTED_CHARACTER_NEW_LINE = '\u0000\u0e40\u0e41\u0e42\u0e43\u0e44'

    private static readonly MIN_FONT_SIZE = 10

    private static _instance: TextAdapter

    private static getInstance() {
        if (!TextAdapter._instance) {
            TextAdapter._instance = new TextAdapter()
        }
        return TextAdapter._instance
    }
    static get instance() {
        return this.getInstance()
    }

    getBitmapText(scene: Scene, keyText: string): Phaser.GameObjects.BitmapText {
        return scene.add.bitmapText(0, 0, keyText, '', TextAdapter.DEFAULT_FONT_SIZE)
    }

    getVectorText(scene: Scene, fontFamilyName: string, fontWeightType?: FontWeighType): Phaser.GameObjects.Text {
        //let weightType = fontWeightType ? FontWeighType[fontWeightType] : 'Bold'

        return scene.add
            .text(0, 0, ' ', {
                fontFamily: fontFamilyName,
                fontSize: TextAdapter.DEFAULT_FONT_SIZE.toString(),
                color: 'white',
            })
            .setPadding(0, 15, 0, 15)
    }

    static autoSizeTextInBound(vectorText: GameObjects.Text, width: number): void {
        while (vectorText.width > width) {
            const fontSize = +vectorText.style.fontSize
            let newFontSize =
                fontSize - 3 - (vectorText.width / vectorText.text.length - width / vectorText.text.length)
            if (newFontSize < TextAdapter.MIN_FONT_SIZE) newFontSize = TextAdapter.MIN_FONT_SIZE

            vectorText.y += 1
            vectorText.setFontSize(newFontSize)
        }
    }

    static autoSizeTextInBoundBitmap(bitmapText: GameObjects.BitmapText, width: number): void {
        while (bitmapText.width > width) {
            const fontSize = bitmapText.fontSize
            let newFontSize =
                fontSize - 3 - (bitmapText.width / bitmapText.text.length - width / bitmapText.text.length)
            if (newFontSize < TextAdapter.MIN_FONT_SIZE) newFontSize = TextAdapter.MIN_FONT_SIZE
            bitmapText.setFontSize(newFontSize)
        }
    }

    static numberConverter(value: number, decimal: number = 0, point: number = 3): string {
        var re = '\\d(?=(\\d{' + (point || 3) + '})+' + (decimal > 0 ? '\\.' : '$') + ')'
        return value.toFixed(Math.max(0, ~~decimal)).replace(new RegExp(re, 'g'), '$&,')
    }

    static lengthOfThaiString(str: string): number {
        var regEx = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER + ']', 'g')
        return str.replace(regEx, '').length
    }

    static splitThaiStringByLegth(str: string, maxLength: number) {
        var regEx = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER + ']', 'g')
        var regExEnd = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER_END + ']', 'g')
        var regExEndUnder = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER_UNDER + ']', 'g')
        var regExEndTop = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER_TOP + ']', 'g')
        var regExEndPushToNewLine = new RegExp('[' + TextAdapter.THAI_UNCOUNTED_CHARACTER_NEW_LINE + ']', 'g')
        let result: string[] = []
        let strTotal: number = str.length
        let startIndex: number = 0

        if (strTotal <= maxLength) {
            result.push(str)
            //console.log(result)
            return result
        }
        // console.log(str)
        // console.log(strTotal)

        while (startIndex < strTotal) {
            let maxLengthLine = maxLength + startIndex
            let line = str.substring(startIndex, maxLengthLine)
            let unCountCharacter: number = line.match(regEx) == null ? 0 : line.match(regEx).length
            let substringEnd =
                maxLengthLine + unCountCharacter + (str.charAt(maxLengthLine + unCountCharacter).match(regEx) ? 1 : 0)

            let checkingBeforeEnd = str.charAt(substringEnd - 1).match(regExEnd) ? substringEnd + 1 : substringEnd
            let resultEnd = str.charAt(checkingBeforeEnd).match(regExEnd) ? checkingBeforeEnd + 1 : checkingBeforeEnd
            let resultEndUnder = str.charAt(resultEnd - 1).match(regExEndUnder)
                ? str.charAt(resultEnd).match(regExEndTop)
                    ? resultEnd + 1
                    : resultEnd
                : resultEnd
            let resultEndPushToNewLine = str.charAt(resultEnd - 1).match(regExEndPushToNewLine)
                ? resultEndUnder - 1
                : resultEndUnder
            let lineWithUnCountCharacter = str.substring(startIndex, resultEndPushToNewLine)

            startIndex = maxLengthLine >= strTotal ? strTotal : startIndex + lineWithUnCountCharacter.length
            result.push(lineWithUnCountCharacter)

            // console.log(`start Index : ${startIndex}`)
            // console.log(`จำนวนที่ต้องตัด : ${maxLength}`)
            // console.log(`ตัดตามจำนวน : ${line}`)
            // console.log(`สระมีทั้งหมด : ${unCountCharacter}`)
            // console.log(`${lineWithUnCountCharacter} |||| ผลจำนวนที่ตัดทั้งหมด : ${lineWithUnCountCharacter.length}`)
        }

        //console.log(result)

        return result
    }
}

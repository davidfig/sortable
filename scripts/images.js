const Canvas = require('canvas')
const fs = require('fs')

let s = 'module.exports={'

const files = [ 'copy', 'move', 'delete', 'reorder', 'cancel' ]

let converted = 0

for (let file of files)
{
    console.log('Converting ' + file + ' image to src...')

    const image = new Canvas.Image()
    image.onload = () =>
    {
        const canvas = Canvas.createCanvas(image.width, image.height)
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0)
        s += file + ':\'' + canvas.toDataURL() + '\','
        converted++
        if (converted === files.length)
        {
            s = s.substr(0, s.length - 1) + '}'
            console.log('Writing src/icons.js...')
            fs.writeFileSync('./src/icons.js', s)
        }
    }
    image.src = 'images/' + file + '.png'
}
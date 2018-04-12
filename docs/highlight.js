import { highlightBlock } from 'highlight.js'
import ForkMe from 'fork-me-github'

// shows the code in the demo
export default function highlight()
{
    var client = new XMLHttpRequest()
    client.open('GET', 'code.js')
    client.onreadystatechange = function()
    {
        var code = document.getElementById('code')
        code.innerHTML = client.responseText
        highlightBlock(code)
    }
    client.send()
    ForkMe()
}
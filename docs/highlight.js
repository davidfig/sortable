const highlight = require('highlight.js')

// shows the code in the demo
module.exports = function()
{
    var client = new XMLHttpRequest()
    client.open('GET', 'code.js')
    client.onreadystatechange = function()
    {
        var code = document.getElementById('code')
        code.innerHTML = client.responseText
        highlight.highlightBlock(code)
    }
    client.send()
}
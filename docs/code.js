const Sortable = require('../src/sortable')

function test()
{
    new Sortable(document.getElementById('example-1'), {
        alwaysInList: true
    })
}

window.onload = function ()
{
    test()
    require('fork-me-github')('https://github.com/davidfig/sortable')
    require('./highlight')()
}
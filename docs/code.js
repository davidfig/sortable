const Sortable = require('../src/sortable')

function test()
{
    new Sortable(document.getElementById('example-1'), {
        name: 'list-1',
        alwaysInList: true
    })

    const two = document.getElementById('example-2')
    new Sortable(two.children[0], { name: 'list-2' })
    new Sortable(two.children[1], { name: 'list-2' })

    const three = document.getElementById('example-3')
    new Sortable(three.children[0], { name: 'list-3' })
    new Sortable(three.children[1], { name: 'list-3', sort: false })

    const four = document.getElementById('example-4')
    new Sortable(four.children[0], { name: 'list-4' })
    new Sortable(four.children[1], { name: 'list-4', sort: false })

    const five = document.getElementById('example-5')
    new Sortable(five.children[0], { name: 'list-5', dragClass: 'entry' })
    new Sortable(five.children[1], { name: 'list-5', dragClass: 'entry', sort: false })
}

window.onload = function ()
{
    test()
    require('fork-me-github')('https://github.com/davidfig/sortable')
    require('./highlight')()
}
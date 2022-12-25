const digests = [
    {filename: 'shared.json', id: 'popular', title: 'popular', subtitle: 'in the past 24 hours'},
    {filename: 'latest.json', id: 'latest', title: 'latest', subtitle: '200 links'}
]

var dateFormat = {hour:"numeric", minute:"numeric", day: "numeric", month: 'long'}

newElement = (element, classList) => {
    const el = document.createElement(element)
    el.classList = classList
    return el
}

renderEntry = (entry) => {

    date = new Date(entry['latest'])

    const link = newElement('a', 'entry')
    link.href = entry.link
    link.target = '_blank'
    
    const content = newElement('div', 'content')

    const title = newElement('div','title')
    title.textContent = entry.title
    content.appendChild(title)

    const context = newElement('div','context')

    const peoplediv = newElement('div','peoplediv')

    const prefix = newElement('span', 'prefix')
    prefix.textContent = 'Shared by'
    peoplediv.appendChild(prefix)

    entry.people.map((person, i) => {
        if (i > 0) {
            let separator = newElement('span','prefix')
            separator.textContent = '·'
            peoplediv.appendChild(separator)
        }
        let persondiv = newElement('a', 'person')
        persondiv.href = person.url
        persondiv.target = '_blank'
        persondiv.textContent = person.display_name
        peoplediv.appendChild(persondiv)
    })

    const post = newElement('a', ['post'])
    post.href = entry.last_post.url
    post.target = '_blank'

    const post_content = newElement('div', ['post_content'])
    post_content.innerHTML = entry.last_post.content

    post.appendChild(post_content)

    context.appendChild(peoplediv)
    context.appendChild(post)
    content.appendChild(context)

    const published = newElement('div', ['published'])
    published.textContent = dateString = date.toLocaleDateString("en-US", dateFormat)
    published.title = 'Last shared'
    content.appendChild(published)

    link.appendChild(content)

    return link
}

download_and_render = (url, container) => {    
    fetch(url).then((response) => {
	response.json().then((entries) => {
	    entries.forEach(e => {
            var link = renderEntry(e, container)
            container.appendChild(link)
        })
	})})
    return container
}

var nav = document.querySelector('.nav')
var streams = document.querySelector('.streams')

digests.forEach(digest => {   

    var stream = newElement('div','stream')
    var anchor = newElement('a', 'anchor')
    anchor.id = digest.id

    var streamTitle = newElement('div', 'streamTitle')
    streamTitle.textContent = digest.title
    stream.appendChild(streamTitle)

    var streamSubtitle = newElement('div', 'streamSubtitle')
    streamSubtitle.textContent = digest.subtitle
    stream.appendChild(streamSubtitle)

    var links = newElement('div','links')
    links = download_and_render(digest.filename, links)
    stream.appendChild(links)
    streams.appendChild(anchor)
    streams.appendChild(stream)

    var navlink = newElement('a', 'navlink')
    navlink.href = `#${digest.id}`
    navlink.textContent = digest.title
    nav.appendChild(navlink)
})
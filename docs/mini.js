var container = document.querySelector('.entries')
var dateFormat = {hour:"numeric", minute:"numeric", day: "numeric", month: 'long'}

render_entry = (entry) => {

    date = new Date(entry['latest'])
    dateString = date.toLocaleDateString("en-US", dateFormat)

    const link = document.createElement('a')
    link.classList = ['entry']
    link.href = entry.link
    link.target = '_blank'
    link.title = dateString
    
    const content = document.createElement('div')
    content.classList = ['content']

    const title = document.createElement('div')
    title.classList = ['title']
    title.textContent = entry.title
    content.appendChild(title)

    const context = document.createElement('div')
    context.classList = ['context']

    const peoplediv = document.createElement('div')
    peoplediv.classList = ['peoplediv']
    
    const prefix = document.createElement('span')
    prefix.classList = ['prefix']
    prefix.textContent = 'Shared by'
    peoplediv.appendChild(prefix)

    entry.people.map(person => {
        let persondiv = document.createElement('a')
        persondiv.classList = ['person']
        persondiv.href = person.url
        persondiv.target = '_blank'
        persondiv.textContent = person.display_name
        peoplediv.appendChild(persondiv)
    })

    const post = document.createElement('a')
    post.href = entry.last_post.url
    post.target = '_blank'
    post.classList = ['post']

    const post_content = document.createElement('post_content')
    post_content.classList = ['post_content']
    post_content.innerHTML = entry.last_post.content

    const post_author = document.createElement('div')
    post_author.classList = ['post_author']
    post_author.textContent = entry.display_name

    post.appendChild(post_content)
    post.appendChild(post_author)

    context.appendChild(peoplediv)
    context.appendChild(post)
    content.appendChild(context)
    link.appendChild(content)

    container.appendChild(link)
}

download_and_render = () => {
    url = "links.json"    
    fetch(url).then((response) => {
	response.json().then((entries) => {
	    entries.forEach(e => render_entry(e))
	})
    })
}

download_and_render()

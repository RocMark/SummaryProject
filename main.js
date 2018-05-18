(function () {
  document.addEventListener('DOMContentLoaded', () => {
    let ajax = {
      init() {
        this.cacheDOM()
        // this.bindEvents()
        this.loadText()
        this.loadJson()
        this.loadGithubAPI()
      },
      cacheDOM() {
        this.cacheTextDom()
        this.cacheUsersDom()
        this.cacheGithubDom()
      },
      cacheTextDom() {
        this.textBtn = document.querySelector('#textBtn')
        this.textField = document.querySelector('#ajaxTextField')
      },
      cacheUsersDom() {
        this.jsonBtn = document.querySelector('#jsonBtn')
        this.userBody = document.querySelector('#userBody')
        this.userTable = document.querySelector('#userTable')
        this.userErrorMsg = document.querySelector('#userErrorMsg')
      },
      cacheGithubDom() {
        this.githubBtn = document.querySelector('#githubBtn')
        this.githubBody = document.querySelector('#githubBody')
        this.githubTable = document.querySelector('#githubTable')
      },
      bindEvents() {
        this.textBtn.addEventListener('click', this.loadText)
        this.jsonBtn.addEventListener('click', this.loadJson)
        this.githubBtn.addEventListener('click', this.loadGithubAPI)
      },
      loadText() {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', 'simpleText.txt', true)
        xhr.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            ajax.textField.innerHTML = this.responseText
          } else if (this.status === 404) {
            console.log('Not Found')
            ajax.textField.innerHTML = 'Not Found'
            ajax.textField.classList.add('text-danger')
          }
        }
        xhr.onerror = function () {
          console.log('Request Error...')
        }
        xhr.send()
      },
      loadJson() {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', './localJson.json', true)
        xhr.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            ajax.renderUser(this.responseText)
          } else if (this.status === 404) {
            ajax.userNotFound()
          }
        }
        xhr.onerror = function () {
          console.log('Request Error...')
        }
        xhr.send()
      },
      userNotFound() {
        ajax.userTable.classList.add('d-none')
        ajax.userErrorMsg.remove('d-none')
      },
      renderUser(str) {
        let jsonData = JSON.parse(str)
        let tplStr = ''
        jsonData.forEach((el) => {
          tplStr += `
        <tr>
          <th scope="row">${el.id}</th>
          <td>${el.name}</td>
          <td>${el.age}</td>
        </tr>
      `
        })
        ajax.userBody.innerHTML = tplStr
      },
      loadGithubAPI() {
        let xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://api.github.com/users/RocMark/repos', true)
        xhr.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
            ajax.renderGithubJson(this.responseText)
          } else if (this.status === 404) {
            console.log('Not Found')
          }
        }
        xhr.onerror = function () {
          console.log('Request Error...')
        }
        xhr.send()
      },
      renderGithubJson(str) {
        let jsonData = JSON.parse(str)
        let tplStr = ''
        let count = 1
        jsonData.forEach((el) => {
          tplStr += `
            <tr>
              <th class="text-center" scope="row">${count}</th>
              <td>${el.name}</td>
              <td class="text-center"><a target="_blank" href="${
                el.html_url
              }">Link</a></td>
            </tr>
          `
          count += 1
        })
        ajax.githubBody.innerHTML = tplStr
      },
    }
    ajax.init()

    let nav = {
      init() {
        this.cacheDom()
        this.bindEvents()
        // this.activeArea('archive')
      },
      cacheDom() {
        this.nav = document.querySelector('#mainNav')
        this.homeLink = document.querySelector('#homeLink')
        this.homePage = document.querySelector('#homeArea')
        this.navItems = document.querySelectorAll('.nav-item')
        this.areas = document.querySelectorAll('.showCaseArea')
      },
      bindEvents() {
        this.homeLink.addEventListener('click', this.homeLinkEvent)
        this.nav.addEventListener('click', this.setActive)
      },
      homeLinkEvent() {
        nav.setAllInActive()
        nav.homePage.classList.remove('d-none')
      },
      activeArea(target) {
        nav.setAllInActive()
        let formatText = target.trim().toLowerCase()
        if (formatText === 'home') {
          nav.showArea('homeArea')
        } else {
          let navItem = document.querySelector(`#${formatText}Link`)
          navItem.classList.add('active')
          nav.showArea(navItem.children[0])
        }
      },
      setActive(e) {
        if (e.target.classList.contains('nav-link')) {
          nav.setAllInActive()
          e.target.parentNode.classList.add('active')
          nav.showArea(e.target)
        }
      },
      setAllInActive() {
        nav.navItems.forEach((el) => {
          el.classList.remove('active')
        })
        nav.areas.forEach((el) => {
          el.classList.add('d-none')
        })
      },
      showArea(target) {
        let targetClass = target
        if (typeof target === 'object') {
          targetClass = `${target.textContent.toLowerCase()}Area`
        }
        let targetArea = document.querySelector(`#${targetClass}`)
        targetArea.classList.remove('d-none')
      },
    }
    nav.init()
    nav.activeArea('fetch')

    let fetch = {
      init() {
        this.cacheDom()
        this.bindEvents()
        this.config()
      },
      config() {
        this.tmpTagList = []
        this.tagMaxLength = 8
      },
      cacheDom() {
        this.cacheTagDom()
        this.cacheFormDom()
      },
      cacheFormDom() {
        this.form = document.querySelector('#fetchForm')
        this.content = this.form.querySelector('[name="postContent"]')
        this.title = this.form.querySelector('[name="postTitle"]')
      },
      cacheTagDom() {
        this.tagInput = document.querySelector('#tagInput')
        this.addTagBtn = document.querySelector('#addTagBtn')
        this.tagDisplayArea = document.querySelector('#tagDisplayArea')
        this.tagHint = document.querySelector('#tagHint')
      },
      bindEvents() {
        this.form.addEventListener('submit', this.sendNewPost)
        this.addTagBtn.addEventListener('click', this.showTagHint)
        this.addTagBtn.addEventListener('click', this.addTag)
        this.tagDisplayArea.addEventListener('click', this.delTagItem)
      },
      sendNewPost(e) {
        e.preventDefault()
        let id = fetch.getLatestID()
        let title = fetch.title.value
        let tags = fetch.tmpTagList
        let content = fetch.content.value
        let jsonObj = {
          id,
          title,
          tags,
          content,
        }
        //* post lastID
        console.log(jsonObj)
        fetch.resetForm()
      },
      resetForm() {
        fetch.form.reset()
        fetch.tagDisplayArea.innerHTML = ''
        fetch.tagHint.classList.add('d-none')
      },
      getLatestID() {
        //* get lastID
        return 123
      },
      addTag(e) {
        e.preventDefault()
        fetch.renderTag(fetch.tagInput.value)
        fetch.tagInput.value = ''
      },
      showTagHint() {
        fetch.tagHint.classList.remove('d-none')
        fetch.tagHint.nextElementSibling.classList.remove('d-none')
      },
      renderHint(msg, color) {
        fetch.tagHint.innerHTML = msg
        fetch.tagHint.style.color = color
      },
      checkTagValid(val) {
        if (val.length > fetch.tagMaxLength) {
          fetch.renderHint(`Max Length ${fetch.tagMaxLength}`, '#ffbb33')
          return false
        }
        if (!val) {
          fetch.renderHint('Input InValid', '#ff4444')
          return false
        }
        fetch.renderHint('Click to Remove Tag', '#00C851')
        return true
      },
      renderTag(val) {
        let formatStr = val.trim()
        if (fetch.checkTagValid(formatStr)) {
          fetch.tmpTagList.push(formatStr)
          let tplStr = `<button class="tagBtn rounded btn btn-info mx-2 " type="button">${formatStr}</button>`
          fetch.tagDisplayArea.innerHTML += tplStr
        }
      },
      delTagItem(e) {
        let tagName = e.target.textContent
        if (e.target.classList.contains('tagBtn')) {
          fetch.tmpTagList = fetch.tmpTagList.filter(el => el !== tagName)
          e.target.remove()
        }
      },
    }
    fetch.init()
  })
}())

const storageController = (() => {
  return {
    storeLibrary: (object) => {
      localStorage.setItem("library", JSON.stringify(object));
    },
    loadLibrary: () => {
      let library;
      if (localStorage.getItem("library") === null) {
        library = Library.getData().library
      }
      else {
        library = JSON.parse(localStorage.getItem("library"))
      }
      return library
    }
  }
})()

const UIController = (() => {
  const selectors = {
    openForm: ".open-form",
    closeForm: ".close-form",
    addBtn: ".submit-add",
    editBtn: ".submit-edit",
    list: ".list-item",
    listContainer: ".list-container",
    form: ".form",
    title: "#title",
    author: "#author",
    pages: "#pages",
    isRead: "#read",
  }

  return {
    createLibraryList: (library) => {
      let html = ""
      library.forEach(book => {
        html +=
          `<tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.pages}</td>
            <td class="read">
              <div style="${book.isRead === "Read" ? "color: forestgreen" : "color: #C86464"}">${book.isRead}</div>
              <div class="toggle">
                <div data-id=${book.id} class="dot-container">
                  <div data-id=${book.id} style="${book.isRead === "Read" ? "float: right; background: forestgreen" : "float: left; background: #C86464"}" class="dot"></div>
                </div>
                <div>Change Status</div>
              </div>
            </td>
            <td>
              <button data-id=${book.id} class="remove">Remove</button>
              <button data-id=${book.id} class="edit">Edit</button>
            </td>
          <tr/>`
      })
      document.querySelector(selectors.list).innerHTML = html
    },
    getSelectors: () => {
      return selectors
    },
    getValues: () => {
      const title = document.querySelector(selectors.title).value
      const author = document.querySelector(selectors.author).value
      const pages = document.querySelector(selectors.pages).value
      const isRead = document.querySelector(selectors.isRead).value

      return { title, author, pages, isRead }
    },
    clearForm: () => {
      document.querySelector(selectors.title).value = ""
      document.querySelector(selectors.author).value = ""
      document.querySelector(selectors.pages).value = ""
      document.querySelector(selectors.isRead).value = "Not read yet"
    },
    showAlert: (message, className) => {
      let alert =
        `<div class="alert ${className}">
          ${message}
        </div>`
      document.querySelector(selectors.form).insertAdjacentHTML("beforebegin", alert)

      setTimeout(() => {
        document.querySelector(".alert").remove();
      }, 1500);
    },
    hideList: () => {
      document.querySelector("table").style.display = "none"
    },
    noBookWarning: () => {
      let html =
        `<div class="empty">
          There is no book on the list.
        </div>`
      document.querySelector(selectors.listContainer).insertAdjacentHTML("beforeend", html)
    },
    removeNoBookWarning: () => {
      const element = document.querySelector(selectors.listContainer)
      element.childElementCount === 3 ? element.children[2].remove() : null
    },
    showList: () => {
      document.querySelector("table").style.display = "block"
    },
    openForm: () => {
      document.querySelector(selectors.form).style.display = "flex"
    },
    closeForm: () => {
      document.querySelector(selectors.form).style.display = "none"
      document.querySelector(selectors.title).value = ""
      document.querySelector(selectors.author).value = ""
      document.querySelector(selectors.pages).value = ""
      document.querySelector(selectors.isRead).value = "Not read yet"
      document.querySelector(selectors.list).childNodes.forEach(tr => tr.classList.remove("warning"))
    },
    addState: () => {
      document.querySelector(selectors.addBtn).style.display = "block"
      document.querySelector(selectors.editBtn).style.display = "none"
    },
    editState: () => {
      document.querySelector(selectors.addBtn).style.display = "none"
      document.querySelector(selectors.editBtn).style.display = "block"
    },
    setFormValues: book => {
      document.querySelector(selectors.title).value = book.title
      document.querySelector(selectors.author).value = book.author
      document.querySelector(selectors.pages).value = book.pages
      document.querySelector(selectors.isRead).value = book.isRead
    }
  }
})()

const Library = (() => {
  class Book {
    constructor(id, title, author, pages, isRead) {
      this.id = id,
        this.title = title,
        this.author = author,
        this.pages = pages,
        this.isRead = isRead;
    }
    toggleStatus() {
      this.isRead === "Read" ? this.isRead = "Not read" : this.isRead = "Read";
      return this.isRead;
    }
  }

  const data = {
    library: [],
    selectedBook: null,
  }

  data.library = [
    new Book(1, "A Game of Thrones", "George R. R. Martin", 694, "Read"),
    new Book(2, "A Clash of Kings", "George R. R. Martin", 768, "Read"),
    new Book(3, "A Storm of Swords", "George R. R. Martin", 973, "Read"),
    new Book(4, "A Feast for Crows", "George R. R. Martin", 753, "Read"),
    new Book(5, "A Dance with Dragons", "George R. R. Martin", 1056, "Not read")
  ]

  return {
    getData: () => {
      return data
    },
    addBookToLibrary: (id, title, author, pages, isRead) => {
      const newBook = new Book(id, title, author, pages, isRead)
      const library = [...storageController.loadLibrary(), newBook]
      return library
    },
    removeBook: id => {
      const filtered = storageController.loadLibrary().filter(book => id != book.id)
      return filtered
    },
    getBookById: id => {
      const [book] = storageController.loadLibrary().filter(book => id == book.id)
      return book
    },
    updateBook: (title, author, pages, isRead) => {
      let updatedBook = null;

      storageController.loadLibrary().forEach(book => {
        if (book.id == data.selectedBook.id) {
          book.title = title
          book.author = author
          book.pages = pages
          book.isRead = isRead
          updatedBook = book;
        }
      })
      return updatedBook;
    },
    changeStatus: id => {
      const library = storageController.loadLibrary()
      const [book] = library.filter(book => id == book.id)
      library.map(item => {
        if (item.id == book.id) {
          return (Book.prototype.toggleStatus.call(book))
        }
      })
      storageController.storeLibrary(library)
    }
  }
})()

const App = ((lib, ui, store) => {
  const selectors = ui.getSelectors()
  const form = document.querySelector("form")

  const submitBook = () => {
    const id = new Date().getTime()
    const { title, author, pages, isRead } = ui.getValues()

    if (form.title.validity.valueMissing) {
      form.title.setCustomValidity("Title cannot be empty!");
    } else {
      form.title.setCustomValidity("");
    }
    if (form.author.validity.valueMissing) {
      form.author.setCustomValidity("Author cannot be empty!");
    } else {
      form.author.setCustomValidity("");
    }
    if (form.pages.validity.valueMissing) {
      form.pages.setCustomValidity("Page number cannot be empty!");
    } else {
      form.pages.setCustomValidity("");
    }
    if (form.read.validity.valueMissing) {
      form.read.setCustomValidity("An item should be selected!");
    } else {
      form.read.setCustomValidity("");
    }

    if (title !== "" && author !== "" && isRead !== "") {
      const library = lib.addBookToLibrary(id, title, author, pages, isRead)
      store.storeLibrary(library)
      ui.createLibraryList(library)
      ui.showAlert("Saved!", "success")
      ui.clearForm()
      ui.closeForm()
      ui.showList()
      ui.removeNoBookWarning()
      form.title.removeAttribute("required")
      form.author.removeAttribute("required")
      form.pages.removeAttribute("required")
      form.read.removeAttribute("required")
    }
  }

  const removeBook = e => {
    if (e.target.classList.contains("remove")) {
      const id = e.target.dataset.id
      const library = lib.removeBook(id)
      store.storeLibrary(library)
      if (store.loadLibrary().length !== 0) {
        ui.showList()
        ui.createLibraryList(library)
      }
      else {
        ui.hideList()
        ui.noBookWarning()
      }
      ui.showAlert("Removed", "danger")
    }
  }

  const submitEdit = e => {
    const { title, author, pages, isRead } = ui.getValues()

    if (title !== "" && author !== "" && isRead !== "" && pages !== "") {
      const { title: selectedTitle, author: selectedAuthor, pages: selectedPages, isRead: selectedIsRead } = lib.getData().selectedBook
      if (title !== selectedTitle || author !== selectedAuthor || pages !== selectedPages || isRead !== selectedIsRead) {
        const updatedBook = lib.updateBook(title, author, pages, isRead)

        const library = store.loadLibrary().map(book => {
          if (book.id === updatedBook.id) {
            return book = updatedBook
          }
          else {
            return book
          }
        })

        store.storeLibrary(library)
        ui.createLibraryList(library)
        ui.showAlert("Changes saved", "success")
        ui.closeForm()
        form.title.removeAttribute("required")
        form.author.removeAttribute("required")
        form.pages.removeAttribute("required")
        form.read.removeAttribute("required")
      }
      else {
        e.preventDefault()
        ui.showAlert("You haven't changed any information", "warning")
      }
    }
  }

  const editBook = e => {
    if (e.target.classList.contains("edit")) {
      e.target.parentNode.parentNode.parentNode.childNodes.forEach(tr => tr.classList.remove("warning"))
      e.target.parentNode.parentNode.classList.add("warning")
      const id = e.target.dataset.id
      const book = lib.getBookById(id)
      ui.openForm()
      ui.editState()
      ui.setFormValues(book)
      lib.getData().selectedBook = book
    }
  }

  const showForm = () => {
    form.title.setAttribute("required", "")
    form.author.setAttribute("required", "")
    form.pages.setAttribute("required", "")
    form.read.setAttribute("required", "")
    ui.addState()
    ui.clearForm()
    ui.openForm()
  }

  const closeForm = () => {
    ui.closeForm()
  }

  const toggleStatus = e => {
    if (e.target.classList.contains("dot") || e.target.classList.contains("dot-container")) {
      const id = e.target.dataset.id
      lib.changeStatus(id)
      ui.createLibraryList(store.loadLibrary())
      ui.showAlert("Status changed", "success")

      const el = e.target.classList.contains("dot") ? e.target.parentNode : e.target
      if (el.style.justifyContent === "") {
        el.style.justifyContent = "flex-end"
      }
      else {
        el.style.justifyContent = "flex-start"
      }
    }
  }

  const loadEventListeners = () => {
    document.querySelector(selectors.addBtn).addEventListener("click", submitBook)
    document.querySelector(selectors.editBtn).addEventListener("click", submitEdit)
    document.querySelector(selectors.list).addEventListener("click", removeBook)
    document.querySelector(selectors.list).addEventListener("click", editBook)
    document.querySelector(selectors.openForm).addEventListener("click", showForm)
    document.querySelector(selectors.closeForm).addEventListener("click", closeForm)
    document.addEventListener("keyup", e => e.key == "Escape" ? closeForm() : null)
    document.querySelector(selectors.list).addEventListener("click", toggleStatus)
  }

  return {
    init: () => {
      const library = store.loadLibrary()
      if (library.length !== 0) {
        ui.showList()
        ui.createLibraryList(library)
      }
      else {
        ui.hideList()
        ui.noBookWarning()
      }
      loadEventListeners()
    }
  }

})(Library, UIController, storageController)

App.init()

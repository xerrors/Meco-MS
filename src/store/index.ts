import { createStore } from 'vuex'

export interface Bookmark {
  title: string,
  path: string,
}

export default createStore({
  state () {
    return {
      marks: [] as Bookmark[],
      show_slides: true,
    }
  },
  mutations: {
    addBookmark (state, mark:Bookmark) {
      if (!Boolean(state.marks.find((item:Bookmark) => {return item.path == mark.path}))) {
        state.marks.push(mark);
      }
    },
    delBookmark (state, path:string) {
      // arr.splice(arr.findIndex(e => e.id === 1), 1)
      const index = state.marks.findIndex((item:Bookmark) => {return item.path == path})
      if (index != -1) {
        state.marks.splice(index, 1)
      } 
    },
    toggleSlides (state) {
      state.show_slides = !state.show_slides;
    },
    setSlidesState (state, option:boolean) {
      state.show_slides = option;
    }
  }
})


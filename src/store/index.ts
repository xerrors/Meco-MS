import { createStore } from "vuex";

export default createStore({
  state() {
    return {
      logged: true,
    };
  },
  mutations: {
    login(state) {
      state.logged = true;
    },
    logout(state) {
      state.logged = false
    }
  },
  actions: {
    login(context) {
      context.commit("login");
    },
    logout(context) {
      context.commit("logout");
    },
  },
});
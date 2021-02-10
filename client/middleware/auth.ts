export default function ({ store, redirect }) {
  if (!store.getters.isLoggedIn) {
    redirect('/register')
  }
}

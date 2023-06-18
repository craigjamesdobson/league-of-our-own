import { useCurrentUser } from 'vuefire';

const monitorUserStatus = () => {
  const router = useRouter();
  const route = useRoute();
  const user = useCurrentUser();

  watch(user, (user, prevUser) => {
    if (prevUser && !user) {
      // user logged out
      router.push({
        path: '/account/login',
        query: {
          redirect: route.fullPath,
        },
      });
    } else if (user && typeof route.query.redirect === 'string') {
      // user logged in
      router.push(route.query.redirect);
    }
  });
};

export { monitorUserStatus };

import { getAuth, signOut } from 'firebase/auth';

function logout() {
  const auth = getAuth();
  return signOut(auth);
}

export default logout;

const contextPath = import.meta.env.VITE_CONTEXT_PATH ?? '';
const baseUrl = `${contextPath}/api`;

export default {
  profile: `${baseUrl}/profile`,
};

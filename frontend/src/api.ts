const contextPath = import.meta.env.BASE_URL;
const baseUrl = `${contextPath}api`;

export default {
  profile: `${baseUrl}/profile`,
  listMyExamsToProctor: `${baseUrl}/proctor/list`,
};

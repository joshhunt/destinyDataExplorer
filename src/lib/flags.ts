const searchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(searchParams.entries());

const flagAdvanced = params.hasOwnProperty("advanced");

export const isAdvanced = () => {
  return flagAdvanced;
};

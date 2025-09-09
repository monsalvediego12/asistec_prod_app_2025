import AppConfig from '@src/app.config';

async function fetchAwsToken(url) {
  let resData = {
    state: false,
    msg: null,
  };
  try {
    await fetch(AppConfig?.aws_url_fetch_app_token, {
      headers: {
        'x-api-key': AppConfig?.aws_app_token,
      },
    })
      .then(response => {
        return response?.json();
      })
      .then(res => {
        resData.state = res?.state || false;
        resData.msg = res?.message || null;
      })
      .catch(error => {});
  } catch (error) {}
  return resData;
}
const appIsFetchAwsToken = AppConfig?.aws_fetch_app_token;
export {fetchAwsToken, appIsFetchAwsToken};


class Config {
    static API_SERVER_URL =  process.env.REACT_APP_API_SERVER_URL || "";
    static DOWNLOADS_BADGE_REFRESH_TIME = 5000;
    static DOWNLOADS_REFRESH_TIME = 5000;
}

export default Config;
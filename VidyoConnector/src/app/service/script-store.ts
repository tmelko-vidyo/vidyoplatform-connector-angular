interface Scripts {
  name: string;
  src: string;
  css: string;
}

export const ScriptStore: Scripts[] = [
  {
    // src: 'https://static.vidyo.io/latest/javascript/VidyoClient/VidyoClient.js?onload=VidyoClientLoaded&webrtc=true&plugin=false',

    name: 'VidyoClient',
    // src: 'https://web-static.alpha.vidyo.com/VidyoConnector/20.1.8/latest_build/VidyoClient.js',
    // css: 'https://web-static.alpha.vidyo.com/VidyoConnector/20.1.8/latest_build/VidyoClient.css'

    /* Load locally 20.1.8 */
    src: '/assets/latest_build/VidyoClient.js',
    css: '/assets/latest_build/VidyoClient.css',
  },
];
